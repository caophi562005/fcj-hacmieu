# Implementation Plan (Simplified — Drop BullMQ, Keep SSE)

- [ ] 1. Record baseline references (read-only)
  - Grep the repo for `PaymentProducer`, `PaymentQueue`, `PAYMENT_QUEUE_NAME`, `CANCEL_PAYMENT_JOB_NAME`, `generateCancelPaymentJobId`, `generateProcessVideoJobId`, `paymentProducer`, `@nestjs/bullmq`, `bullmq` and document the exact match list. All of these must be empty after the cleanup (except for string matches inside build artifacts under `.next/`, `dist/`, or `.nx/cache/`, which are acceptable).
  - Confirm `generateProcessVideoJobId` has zero importers outside `libs/utils/src/lib/bullmq.util.ts` itself.
  - Confirm `@nestjs/bullmq` and `bullmq` appear only under `apps/services/payment-service/src/app/modules/payment/{producers,queues}`.
  - Confirm SSE wiring in `apps/bffs/customer-bff/src/app/payment-service/controllers/transaction.controller.ts` does not depend on BullMQ.
  - _Supports: Property 3, Property 8_

- [ ] 2. Remove BullMQ from payment-service
  - [ ] 2.1 `payment.service.ts`: drop the `cancelPaymentJob` block from `create`, drop `paymentProducer` from the constructor, drop the `PaymentProducer` import. `create` becomes `return this.paymentRepository.create(data);`. `getOne`, `list`, `updateStatus`, `delete` untouched.
  - [ ] 2.2 `payment.module.ts`: remove `BullModule.registerQueue`, the `BullModule` import, the `PAYMENT_QUEUE_NAME` import, `PaymentProducer` and `PaymentQueue` from `providers`, and `PaymentProducer` from `exports`. Keep `SqsModule.register(...)`, `ClientsModule.register(...)`, `PaymentGrpcController`, `PaymentRepository`, `PaymentService`, `PaymentConsumerService`.
  - [ ] 2.3 `transaction.repository.ts`: remove `paymentProducer` constructor parameter, remove `this.paymentProducer.removeJob(payment.id)` from the `Promise.all([...])` (replace the array with a direct `tx.payment.update(...)` call), remove the `PaymentProducer` import. The return envelope `{ paymentCode, paymentId, userId, message }` must be unchanged.
  - [ ] 2.4 Delete files:
    - `apps/services/payment-service/src/app/modules/payment/producers/payment.producer.ts`
    - `apps/services/payment-service/src/app/modules/payment/queues/payment.queue.ts`
    - Remove the now-empty `producers/` and `queues/` directories.
  - _Supports: Property 3, Property 4, Property 8_

- [ ] 3. Prune shared libs
  - [ ] 3.1 `libs/constants/src/lib/payment.constant.ts`: remove `PAYMENT_QUEUE_NAME` and `CANCEL_PAYMENT_JOB_NAME`. Keep enums, types, and all other exports.
  - [ ] 3.2 Delete `libs/utils/src/lib/bullmq.util.ts` (entire file — both helpers are unused).
  - [ ] 3.3 If `libs/utils/src/index.ts` or `libs/utils/src/lib/index.ts` re-exports `bullmq.util`, remove that re-export.
  - [ ] 3.4 Confirm no remaining importer via grep.
  - _Supports: Property 3_

- [ ] 4. Remove unused npm packages
  - [ ] 4.1 Edit `package.json`: remove `"@nestjs/bullmq"` and `"bullmq"` from `dependencies`. Do not reorder other entries.
  - [ ] 4.2 Run `pnpm install` so `pnpm-lock.yaml` drops the removed packages and their transitive-only deps. Commit both changes together.
  - [ ] 4.3 Confirm the repository still builds: `pnpm nx run-many -t build --projects=payment-service,customer-bff,customer-web`.
  - _Supports: Property 3_

- [ ] 5. Update `QrPaymentClient.tsx` — keep SSE, add paid-state UI, update in place
  - Add `useState(payment.status)` seeded from server-rendered payment. Derive `isPaid = status === 'SUCCESS'`.
  - Keep the `useEffect` that opens `EventSource('/api/payment/sse')` when `!isPaid`. On a matching message (`data.paymentId === payment.id`), call `setStatus('SUCCESS')`. Do NOT call `router.push` or `router.replace` — remove `useRouter`.
  - Close the `EventSource` when the effect tears down or when `isPaid` becomes true.
  - Render branch: `isPaid` → "Đã thanh toán" card (heading, payment code, Trang chủ + Đơn mua buttons); otherwise → existing QR card (image, code, status, CTAs).
  - Ensure a11y: `alt="QR thanh toán"` on the image, `aria-hidden` on decorative icons, `cursor-pointer` on CTAs, focus-visible styles retained via existing Tailwind classes.
  - _Supports: Property 6, Property 7_

- [x] 6. `next.config.js` `api.vietqr.io` allowlist (already applied)
  - Verify `apps/webs/customer-web/next.config.js` contains:

    ```javascript
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'api.vietqr.io', pathname: '/**' },
      ],
    }
    ```

  - No further action required.
  - _Supports: Property 5_

- [ ] 7. Verify WALLET redirect + WALLET QR URL guardrails remain fixed
  - `PaymentView.tsx#handleCreateOrder`: the `if (paymentMethod === 'ONLINE' || paymentMethod === 'WALLET')` branch pushes to `/payment/qr/${res.paymentId}`.
  - `payment.service.ts#getOne`: the `if (method === ONLINE || method === WALLET)` branch builds the VietQR URL.
  - COD still falls through: `setIsOrderSuccess(true)` and `qrCode: undefined`.
  - _Supports: Property 1, Property 2, Property 4_

- [ ] 8. Webhook → SSE regression check
  - Verify `transaction.controller.ts#receiver` still calls `paymentStreamService.publish(result)` after `paymentService.receiver(body)`.
  - Verify `transaction.repository.ts#receiver` still returns `{ paymentCode, paymentId, userId, message: 'Message.ReceivedSuccessfully' }`.
  - Verify `/payment/transaction/sse` still filters by `userId`.
  - No code change expected here; this task is a read-only verification.
  - _Supports: Property 8_

- [ ] 9. Checkpoint — static + build + smoke
  - Static checks: grep returns empty for each banned symbol; deleted files and directories are gone; `package.json` no longer lists the banned packages.
  - Build: `pnpm nx run-many -t build --projects=payment-service,customer-bff,customer-web` succeeds.
  - Manual smoke:
    1. WALLET order → redirected to `/payment/qr/:id`. QR image renders, no `next/image` hostname error.
    2. Simulate webhook success (hit `POST /payment/transaction/receiver` with a matching `code`/`amount`). Browser receives SSE event. UI flips to "Đã thanh toán" in place. URL does not change.
    3. Refresh the same `/payment/qr/:id` URL → "Đã thanh toán" card renders on first paint.
    4. COD order → direct success screen, no QR page.
  - Stop and raise any failure; do not patch speculatively.
