# Database scripts và Prisma Migrate

Mỗi microservice giữ lịch sử migration riêng trong
`apps/services/<service>/prisma/migrations`. Migration `20260910000000_baseline`
khởi tạo các bảng từ Prisma schema; migration `20260910010000_database_objects`
chứa View, Function, Stored Procedure và Trigger không biểu diễn được bằng Prisma
Schema Language.

## Chạy trên database mới

```bash
pnpm db:migrate
pnpm db:verify-objects
```

`db:migrate` chạy `prisma migrate deploy` cho cả chín service. Script kiểm thử kết
nối bằng các biến `*_MYSQL_DATABASE_URL` trong `.env`, kiểm tra định nghĩa trong
`information_schema`, chạy các function/procedure/view/trigger và xóa toàn bộ dữ
liệu kiểm thử trong khối `finally`.

## Baseline database cũ đã tạo bằng `prisma db push`

Chỉ khi database đã có bảng nhưng chưa có bảng `_prisma_migrations`, đối chiếu
schema trước rồi đánh dấu baseline một lần cho từng service:

```bash
prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
prisma migrate resolve --applied 20260910000000_baseline
prisma migrate deploy
```

Chạy các lệnh trên trong thư mục service tương ứng. Không dùng `resolve --applied`
cho database trống, vì database trống cần thực thi migration baseline để tạo bảng.

## Nơi ứng dụng sử dụng đối tượng SQL

| Đối tượng                       | Vị trí gọi/kích hoạt                                        |
| ------------------------------- | ----------------------------------------------------------- |
| `vw_active_products`            | `ProductRepository.validateProducts()`                      |
| `vw_shop_credit_revenue`        | `CreditRepository.getRevenueSummary()`                      |
| `vw_wallet_transaction_history` | `WalletRepository.listTransactions()`                       |
| `vw_pending_payouts`            | `PayoutRepository.list()` với trạng thái `PENDING`          |
| `vw_product_rating_summary`     | `ReviewRepository.recalculateRatingAggregate()`             |
| `fn_calculate_discount`         | `OrderRepository.calculateDiscount()`                       |
| `fn_order_grand_total`          | `OrderRepository.create()`                                  |
| `fn_wallet_available_balance`   | `WalletRepository.upsert()`                                 |
| `fn_average_rating`             | `ReviewRepository.recalculateRatingAggregate()`             |
| `fn_is_promotion_active`        | `PromotionRepository.check()`                               |
| `sp_adjust_wallet`              | `WalletRepository.adjust()`                                 |
| `sp_create_payout_request`      | `PayoutRepository.create()`                                 |
| `sp_change_order_status`        | `OrderRepository.updateStatus()`                            |
| `sp_use_promotion`              | `RedemptionRepository.createFromOrder()`                    |
| `sp_process_bank_transaction`   | `TransactionRepository.receiver()`                          |
| Trigger Wallet/Credit           | Tự chạy khi procedure/repository ghi số dư                  |
| Trigger OrderItem               | Tự chạy khi `OrderRepository.create()` ghi chi tiết đơn     |
| Trigger Review                  | Tự chạy khi `ReviewRepository.create/update()` ghi đánh giá |
| Trigger Payment                 | Tự chạy khi repository cập nhật chứng từ đã thành công      |
