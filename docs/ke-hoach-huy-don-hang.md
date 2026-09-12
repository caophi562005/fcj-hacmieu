# Kế hoạch triển khai — Flow huỷ đơn hàng (Order Cancellation) an toàn

> **Tài liệu dành cho Codex / agent triển khai.** Đọc kỹ toàn bộ trước khi làm.
> Ngôn ngữ: tiếng Việt. Mã nguồn, tên file, symbol giữ nguyên tiếng Anh.

---

## 1. Bối cảnh dự án

- **Tên:** V-Shop — sàn thương mại điện tử đa người bán (multi-vendor marketplace).
- **Kiến trúc:** Monorepo Nx + pnpm + TypeScript. Backend NestJS (microservices), frontend Next.js 16.
- **Các service liên quan feature này:**
  - `apps/services/order-service` — authority trạng thái đơn hàng.
  - `apps/services/catalog-service` — tồn kho SKU.
  - `apps/services/payment-service` — thanh toán / refund.
  - `apps/services/wallet-service` — ví V-Xu.
  - `apps/services/promotion-service` — voucher / redemption.
  - `apps/services/utility-service` — notification.
  - `apps/bffs/{customer,seller,admin}-bff` — gateway BFF.
  - `apps/webs/{customer,seller,admin}-web` — frontend.
- **Message queue:** SQS (thư viện `@ssut/nestjs-sqs`), cấu hình tập trung tại `libs/configurations/src/lib/sqs.config.ts`.
- **Cơ sở dữ liệu:** Prisma, mỗi service có schema riêng trong `apps/services/<svc>/prisma/schema.prisma`.
- **Hạ tầng:** Terraform tại `terraform/singapore-dev/` + module mới `terraform/modules/commerce-queues/`.

---

## 2. Mục tiêu tổng thể

Hoàn thiện **flow huỷ đơn hàng end-to-end** đảm bảo tính nhất quán giữa các service:

1. Huỷ đơn chỉ được phép ở trạng thái `PENDING` / `CONFIRMED`, theo đúng quyền của từng actor (customer / seller / admin).
2. Tồn kho được **reserve** lúc đặt hàng và **release** đúng một lần khi huỷ — không âm kho, không tăng/giảm trùng.
3. Bù trừ đầy đủ: hoàn tiền (payment), hoàn V-Xu (wallet), trả voucher (promotion), thông báo (notification).
4. Idempotent: huỷ nhiều lần, SQS duplicate, out-of-order đều chỉ áp dụng hiệu ứng đúng một lần.
5. Payment webhook không bao giờ "hồi sinh" đơn đã huỷ.
6. Không huỷ được đơn từ `SHIPPING` trở đi (chuyển sang return/refund flow — ngoài phạm vi).

---

## 3. Nguyên tắc bất biến (bắt buộc tuân thủ)

1. **KHÔNG sửa file** `docs/bao-cao-mon-hoc-thuong-mai-dien-tu.md` (file báo cáo của người dùng, đang được chỉnh sửa thủ công). Tuyệt đối không đụng tới.
2. **KHÔNG commit, push, rewrite history.** Chỉ sửa file trong working tree.
3. **KHÔNG đọc / sửa `.env`.** Chỉ được dùng `.env.example`. Không đưa secret vào bất kỳ file nào.
4. **TDD:** viết test Vitest trước (red) → triển khai (green) → chạy lại. Không mô phỏng (mock) khi có thể dùng repository/in-memory deterministic.
5. **Không refactor ngoài phạm vi feature.** Chỉ sửa những gì liên quan tới huỷ đơn.
6. **Idempotency & atomicity:** mọi mutation quan trọng phải dùng compare-and-set (điều kiện `where: { status: ... }`) và business-key uniqueness trong DB.
7. **Actor identity từ token/BFF**, không bao giờ tin `actorId/actorType` từ body public.

---

## 4. Trạng thái hiện tại (đã triển khai — KHÔNG làm lại)

Một phiên Codex trước đã triển khai phần lớn nhưng **bị dừng giữa chừng trước khi verify** (prisma generate, test, build). Các phần ĐÃ CÓ (chỉ xác minh, sửa lỗi nếu sai — không viết lại từ đầu):

### 4.1 State machine & phân quyền huỷ
- `apps/services/order-service/src/app/modules/order/services/order-cancellation.policy.ts` — `canCancelOrder`, `isGenericTransitionAllowed`, `assertCancellationAuthorized`.
- Generic transition matrix trong policy (PENDING→CONFIRMED, CONFIRMED→SHIPPING, SHIPPING→COMPLETED); `CANCELLED`/`REFUNDED` bị loại khỏi generic status update.

### 4.2 Phân bổ chi phí theo đơn (tách voucher/coin)
- `apps/services/order-service/src/app/modules/order/services/order-allocation.ts` — tách `voucherDiscount`, `coinApplied`, `cashPayable`.
- Order schema/repository đã lưu riêng `voucherDiscount` và `coinApplied` (xem `order.repository.ts`).

### 4.3 Reservation / release tồn kho
- `apps/services/catalog-service/src/app/modules/sku/services/inventory-reservation.policy.ts` — máy trạng thái RESERVED/RELEASED/CANCELLED_BEFORE_RESERVE, xử lý RESERVE/RELEASE, tombstone cho huỷ-trước-reserve.
- `apps/services/catalog-service/src/app/modules/sku/repositories/sku.repository.ts` — `reserve(orderId, items)`, `release(orderId)` idempotent, transaction theo `skuId`, điều kiện `stock >= quantity`, `deletedAt = null`.

### 4.4 Transactional outbox + routing + SQS
- `apps/services/order-service/src/app/modules/order/services/order-outbox-routing.ts` — route theo `eventType` → queue key (INVENTORY/PAYMENT/WALLET/PROMOTION/NOTIFICATION/SETTLEMENT).
- `apps/services/order-service/src/app/modules/order/services/order-outbox-publisher.service.ts` — publisher đã được tổng quát hoá theo destination.
- `apps/services/order-service/src/app/modules/order/services/cancellation-result-consumer.service.ts` — consumer nhận kết quả bù trừ.
- `apps/services/payment-service/src/app/modules/payment/services/payment-cancellation.policy.ts` — chính sách huỷ payment.
- `apps/services/wallet-service/src/app/modules/wallet/services/wallet-command-consumer.service.ts` — hoàn V-Xu (source REFUND, referenceId = orderId).
- `apps/services/utility-service/src/app/modules/notification/services/notification-command-consumer.service.ts` — thông báo huỷ.
- `apps/services/promotion-service/src/app/modules/redemption/services/redemption-consumer.service.ts` — release voucher (đã sửa).
- `libs/configurations/src/lib/sqs.config.ts` — thêm queue mới.

### 4.5 Schema / contract
- Prisma đã thêm model ở: `order-service`, `catalog-service`, `payment-service`, `promotion-service`, `utility-service` (xem `git diff`).
- `libs/interfaces/src/lib/protos/order.proto` + `proto-types/order.ts` đã thêm cancel API.
- DTO/schema: `libs/interfaces/src/lib/dtos/order/order.dto.ts`, `libs/interfaces/src/lib/models/order/*`, `libs/schemas/src/lib/order/other.schema.ts`.

### 4.6 API / BFF
- `apps/bffs/{customer,seller,admin}-bff/src/app/order-service/controllers/order.controller.ts` — endpoint cancel.
- `apps/bffs/seller-bff/src/app/order-service/services/order.service.ts` — gọi cancel chuyên dụng.

### 4.7 UI
- `apps/webs/customer-web/src/app/profile/orders/[id]/CancelOrderButton.tsx` — nút huỷ cho customer.
- `apps/webs/{seller,admin}-web/.../OrderStatusActions.tsx` + `actions.ts` + `lib/order.ts` — chuyển sang cancel action + dialog lý do.
- `apps/webs/customer-web/src/app/payment/qr/[paymentId]/QrPaymentClient.tsx` — dừng polling khi FAILED/CANCELLED.

### 4.8 Hạ tầng
- `terraform/modules/commerce-queues/` — module mới cho commerce queues + DLQ.
- `terraform/singapore-dev/{main.tf,output.tf,app-irsa-policy.json}` — đã tham chiếu module.

### 4.9 Test đã viết (chưa chạy)
- `apps/services/order-service/src/app/modules/order/services/order-cancellation.policy.spec.ts`
- `apps/services/order-service/src/app/modules/order/services/order-allocation.spec.ts`
- `apps/services/order-service/src/app/modules/order/services/order-outbox-routing.spec.ts`
- `apps/services/order-service/src/app/modules/order/services/cancel-order-contract.spec.ts`
- `apps/services/order-service/src/app/modules/order/repositories/order.repository.spec.ts`
- `apps/services/catalog-service/src/app/modules/sku/services/inventory-reservation.policy.spec.ts`
- `apps/services/payment-service/src/app/modules/payment/services/payment-cancellation.policy.spec.ts`
- `apps/services/payment-service/src/app/modules/transaction/repositories/transaction.repository.spec.ts`
- `apps/services/order-service/vitest.config.ts`, `apps/services/catalog-service/vitest.config.ts`, `apps/services/payment-service/vitest.config.ts`

---

## 5. Công việc CÒN LẠI (cần làm tiếp)

### 5.1 Verify & sửa lỗi (ƯU TIÊN CAO NHẤT)
1. **Prisma generate** cho MỌI service có schema đổi: order, catalog, payment, promotion, utility.
   ```bash
   pnpm nx run order-service:generate-prisma
   # (tên target thực tế: xem package.json / project.json của từng service; nếu chưa có thì dùng `prisma generate` trong thư mục service)
   ```
2. **Regenerate ts-proto** sau khi đổi `order.proto`.
3. **Chạy test Vitest** của 3 service đã có config; sửa mọi test đỏ.
4. **Build** toàn bộ service/BFF/web bị ảnh hưởng; sửa lỗi type/compile do sinh ra từ thay đổi.
5. **Lint** nơi có cấu hình.

### 5.2 Xác minh tính đầy đủ (đọc code, bổ sung nếu thiếu)
- [ ] `order.service.ts` — cancel path có ghi outbox cho đủ các effect (INVENTORY_RELEASE, PAYMENT_CANCEL, WALLET_REFUND, PROMOTION_RELEASE, NOTIFICATION) **trong cùng transaction** với việc đổi trạng thái `CANCELLED`.
- [ ] Payment webhook (`transaction.service.ts` / `payment.service.ts`) — chỉ confirm order khi payment intent còn PENDING và order chưa terminal; không hồi sinh đơn đã huỷ. Inbound transfer chỉ PENDING; validate direction.
- [ ] `payment.repository.ts` / schema — có `PaymentAllocation` (paymentId + orderId) nếu cần cho thanh toán nhiều shop.
- [ ] Wallet idempotency — hoàn V-Xu phải idempotent theo `referenceId = orderId` (dùng cơ chế unique sẵn có của wallet, KHÔNG cần schema mới nếu wallet đã có `@@unique` trên reference).
- [ ] Promotion redemption — chỉ giảm `usedCount` / trả voucher khi order huỷ là order duy nhất còn active trên redemption; nhiều order → chỉ gỡ order khỏi danh sách.
- [ ] Settlement — chặn tạo settlement cho order `CANCELLED`.
- [ ] GHN — hiện chỉ tính phí, KHÔNG phát sinh API huỷ vận đơn. Để lại bước rõ ràng "no-op / not-required" (KHÔNG bịa API shipment).
- [ ] Module wiring — các consumer mới phải được `provide`/`register` trong module tương ứng (đã thấy `order.module.ts`, `wallet.module.ts`, `notification.module.ts`, `redemption.module.ts`, `sku.module.ts`, `payment.module.ts` bị sửa — xác minh đúng).
- [ ] `project.json` / `vitest.config.ts` — test target chạy được.

### 5.3 Bổ sung test còn thiếu (nếu chưa có)
- Concurrent checkout (2 checkout cạnh tranh 1 sản phẩm stock=1 → đúng 1 thành công).
- Cancel trước khi reserve được xử lý (tombstone).
- Duplicate / out-of-order SQS cho reserve và release.
- Late payment cho order đã huỷ (không confirm lại order, vẫn lưu record reconciliation).
- Multi-shop: phân bổ coin/voucher/payment theo từng order.
- COD vs online payment.
- Endpoint validation (reasonCode bắt buộc, actor từ BFF).

---

## 6. Các file quan trọng cần đọc khi sửa

| Mục | Đường dẫn |
|---|---|
| Cancel policy | `apps/services/order-service/src/app/modules/order/services/order-cancellation.policy.ts` |
| Order service | `apps/services/order-service/src/app/modules/order/services/order.service.ts` |
| Order repository | `apps/services/order-service/src/app/modules/order/repositories/order.repository.ts` |
| Outbox publisher | `apps/services/order-service/src/app/modules/order/services/order-outbox-publisher.service.ts` |
| Outbox routing | `apps/services/order-service/src/app/modules/order/services/order-outbox-routing.ts` |
| Reservation policy | `apps/services/catalog-service/src/app/modules/sku/services/inventory-reservation.policy.ts` |
| SKU repository | `apps/services/catalog-service/src/app/modules/sku/repositories/sku.repository.ts` |
| SKU consumer | `apps/services/catalog-service/src/app/modules/sku/services/sku-consumer.service.ts` |
| Payment cancel policy | `apps/services/payment-service/src/app/modules/payment/services/payment-cancellation.policy.ts` |
| Payment consumer | `apps/services/payment-service/src/app/modules/payment/services/payment-consumer.service.ts` |
| Transaction service | `apps/services/payment-service/src/app/modules/transaction/services/transaction.service.ts` |
| Wallet consumer | `apps/services/wallet-service/src/app/modules/wallet/services/wallet-command-consumer.service.ts` |
| Redemption repo | `apps/services/promotion-service/src/app/modules/redemption/repositories/redemption.repository.ts` |
| SQS config | `libs/configurations/src/lib/sqs.config.ts` |
| Proto | `libs/interfaces/src/lib/protos/order.proto` |
| Terraform queues | `terraform/modules/commerce-queues/` |

---

## 7. Lệnh verify (chạy sau khi sửa)

```bash
# 1. Generate Prisma client cho các service đổi schema
pnpm nx run-many -t generate-prisma --projects=order-service,catalog-service,payment-service,promotion-service,utility-service

# 2. Regenerate proto
pnpm generate-ts-proto   # hoặc lệnh tương ứng trong package.json

# 3. Test
pnpm nx run-many -t test --projects=order-service,catalog-service,payment-service

# 4. Build các service + BFF + web bị ảnh hưởng
pnpm nx run-many -t build --projects=order-service,catalog-service,payment-service,promotion-service,wallet-service,utility-service,customer-bff,seller-bff,admin-bff

# 5. Build full (nếu khả thi)
pnpm run build
```

> **Lưu ý:** Tên target `generate-prisma` / `test` có thể khác — tra `project.json` của từng service. Nếu `pnpm run build` quá lâu, ưu tiên build từng nhóm bằng `nx run-many`.

---

## 8. Tiêu chí hoàn thành (definition of done)

- [ ] Tất cả test mới chạy green.
- [ ] Prisma client + ts-proto được regenerate; không lỗi type.
- [ ] Build các service/BFF/web bị ảnh hưởng thành công.
- [ ] Huỷ đơn `PENDING`/`CONFIRMED` theo đúng quyền actor; `SHIPPING` trở đi bị từ chối.
- [ ] Generic status update không thể set `CANCELLED`/`REFUNDED`.
- [ ] Release tồn kho idempotent; không âm kho; không tăng trùng.
- [ ] Payment webhook không hồi sinh đơn đã huỷ; late transfer được ghi nhận để đối soát, không confirm order.
- [ ] V-Xu, voucher, notification bù trừ đúng và idempotent theo order.
- [ ] UI customer có nút huỷ; seller/admin huỷ qua dialog lý do; QR dừng polling khi huỷ.
- [ ] File `docs/bao-cao-mon-hoc-thuong-mai-dien-tu.md` không bị thay đổi.
- [ ] Báo cáo trung thực phần còn thiếu / giới hạn (ví dụ: GHN chưa có API huỷ vận đơn, refund ngân hàng thật chưa có).
