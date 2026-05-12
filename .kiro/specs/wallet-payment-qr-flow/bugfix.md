# Bugfix: WALLET Payment QR Flow (Drop BullMQ, Keep SSE)

## Bug Summary

When a customer picks "Ví điện tử" (WALLET), the frontend was skipping the QR page and the backend was not generating a QR URL for WALLET. That part is already patched. The remaining issues:

1. The payment service still drags along BullMQ (`PaymentProducer`, `PaymentQueue`, `PAYMENT_QUEUE_NAME`, `CANCEL_PAYMENT_JOB_NAME`) for a cancel-payment timeout job that product no longer wants.
2. `QrPaymentClient.tsx` treats every payment the same regardless of `payment.status` — a user who revisits `/payment/qr/:id` after a successful payment still sees the QR card.
3. `next/image` in `customer-web` blocks `https://api.vietqr.io/...` unless the host is declared in `next.config.js`.
4. `generateProcessVideoJobId` in `libs/utils/src/lib/bullmq.util.ts` is dead — nothing imports it. It should go together with the rest of the BullMQ removal.
5. `@nestjs/bullmq` and `bullmq` packages are only used by the two payment queue files. Once those files are deleted the packages are unused and must be removed from `package.json`.

Real-time payment update is delivered via the existing SSE stream from `customer-bff`'s `TransactionController` (webhook → `paymentStreamService.publish` → SSE → browser). This stream stays as-is. The QR page's `EventSource('/api/payment/sse')` listener also stays, but instead of redirecting the user away on a SUCCESS event, it flips the local state so the page re-renders the "Đã thanh toán" card in place.

## Bug Condition C(X)

**C(X)** holds when ANY of the following is true:

1. `apps/services/payment-service` still references `PaymentProducer`, `PaymentQueue`, `BullModule`, `@nestjs/bullmq`, or `bullmq`.
2. `libs/constants/src/lib/payment.constant.ts` still exports `PAYMENT_QUEUE_NAME` or `CANCEL_PAYMENT_JOB_NAME`.
3. `libs/utils/src/lib/bullmq.util.ts` still exists (it contains only BullMQ-related helpers and both will be removed).
4. `package.json` still lists `@nestjs/bullmq` or `bullmq` in `dependencies`.
5. Visiting `/payment/qr/:paymentId` for a payment whose `status === 'SUCCESS'` renders the QR card instead of an "Đã thanh toán" card.
6. Receiving a SUCCESS SSE event for the current payment on the QR page navigates the user away (`router.replace('/profile/orders')`) instead of updating the card in place.
7. `next/image` in `customer-web` rejects `https://api.vietqr.io/...`.
8. Any file besides those listed under "Affected Files" is modified.

## Root Cause Analysis

- The BullMQ cancel-payment job was the only customer of `PaymentProducer`, `PaymentQueue`, `PAYMENT_QUEUE_NAME`, `CANCEL_PAYMENT_JOB_NAME`, and `generateCancelPaymentJobId`. Removing the product requirement removes the only caller; the rest is dead wiring.
- `generateProcessVideoJobId` was shipped as a companion helper but no module imports it (verified by grep over `apps/**` and `libs/**`). Removing the whole `bullmq.util.ts` file is safe.
- `@nestjs/bullmq` and `bullmq` packages are imported only from `producers/payment.producer.ts` and `queues/payment.queue.ts`. Once these files are deleted, the packages become unused.
- The "already paid" UI was never implemented because the previous design expected a short-lived timeout window; without the timer, the page must reflect the current status explicitly.
- The SSE navigation behavior (`router.replace('/profile/orders')`) was tied to that same transient model. With the new UI, reacting to SSE by updating local state is the clearer UX.

## Defects and Changes

### Defect 1 — Payment service still schedules cancel-payment jobs

`payment.service.ts#create` calls `this.paymentProducer.cancelPaymentJob(...)` for ONLINE/WALLET. Remove the entire `if` block; delete the `paymentProducer` constructor parameter and the `PaymentProducer` import.

### Defect 2 — `payment.module.ts` wires BullMQ

Remove `BullModule.registerQueue({ name: PAYMENT_QUEUE_NAME, ... })`, the `@nestjs/bullmq` import, the `PAYMENT_QUEUE_NAME` import, and drop `PaymentProducer` and `PaymentQueue` from `providers`. Remove `PaymentProducer` from `exports`.

### Defect 3 — Transaction repository uses queue helper

`transaction.repository.ts` injects `PaymentProducer` solely to call `removeJob(payment.id)` on webhook success. Remove both. Keep the status update, the payment-lookup transaction, and the returned envelope (`{ paymentCode, paymentId, userId, message }`) — the SSE publishing in `transaction.controller.ts` depends on that envelope.

### Defect 4 — Queue files still exist

Delete:

- `apps/services/payment-service/src/app/modules/payment/producers/payment.producer.ts`
- `apps/services/payment-service/src/app/modules/payment/queues/payment.queue.ts`

Remove the now-empty `producers/` and `queues/` directories.

### Defect 5 — Shared constants and utility

- `libs/constants/src/lib/payment.constant.ts`: remove `PAYMENT_QUEUE_NAME`, `CANCEL_PAYMENT_JOB_NAME`. Keep the enums and types.
- `libs/utils/src/lib/bullmq.util.ts`: delete the entire file (both helpers are unused after the cleanup). If `libs/utils/src/index.ts` re-exports it, prune the re-export.

### Defect 6 — Unused packages in `package.json`

Remove `"@nestjs/bullmq": "^11.0.4"` and `"bullmq": "^5.73.0"` from `dependencies`. Run `pnpm install` so `pnpm-lock.yaml` reflects the change. Do not touch `ms`, it is still used elsewhere.

### Defect 7 — `QrPaymentClient.tsx` lacks paid-state UI and mishandles SSE

New structure:

- Initial `payment.status` seeds a local `status` state.
- If `status === 'SUCCESS'`, render "Đã thanh toán" card.
- Otherwise, render the QR card and open `EventSource('/api/payment/sse')`.
- On SSE message whose `data.paymentId === payment.id`, `setStatus('SUCCESS')`. The component re-renders and shows the "Đã thanh toán" card in place. No `router.replace`.
- Close `EventSource` on unmount and also when the local status becomes SUCCESS.

### Defect 8 — `next.config.js` allowlist

Already fixed: `images.remotePatterns` contains `{ protocol: 'https', hostname: 'api.vietqr.io', pathname: '/**' }`. Keep.

## Expected Behavior (After Fix)

1. COD → no redirect, no QR, no job. Unchanged.
2. WALLET / ONLINE → redirect to `/payment/qr/:paymentId`. Backend persists payment, no queue work.
3. User lands on `/payment/qr/:id`:
   - `status === 'SUCCESS'` → "Đã thanh toán" card with links back to orders/home.
   - `status !== 'SUCCESS'` → QR card rendered. SSE connection subscribes to `/api/payment/sse`.
4. Webhook success path:
   - `transaction.repository.ts#receiver` marks the payment as `SUCCESS` and returns `{ paymentCode, paymentId, userId, message }`.
   - `TransactionController#receiver` publishes this envelope via `paymentStreamService.publish(result)`.
   - SSE stream filters by `userId` and forwards to the browser.
   - `QrPaymentClient` receives the event, matches on `paymentId`, and flips local status to `SUCCESS`. Page re-renders to the "Đã thanh toán" card live.
5. No references to BullMQ in `apps/` or `libs/`. `package.json` no longer lists `@nestjs/bullmq` or `bullmq`.

## Affected Files

| File                                                                                               | Change                                                                                      |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `apps/services/payment-service/src/app/modules/payment/services/payment.service.ts`                | Drop `paymentProducer` dep and the cancel-payment branch from `create`. `getOne` unchanged. |
| `apps/services/payment-service/src/app/modules/payment/payment.module.ts`                          | Remove `BullModule`, `PAYMENT_QUEUE_NAME`, `PaymentProducer`, `PaymentQueue`.               |
| `apps/services/payment-service/src/app/modules/payment/producers/payment.producer.ts`              | Delete.                                                                                     |
| `apps/services/payment-service/src/app/modules/payment/queues/payment.queue.ts`                    | Delete.                                                                                     |
| `apps/services/payment-service/src/app/modules/transaction/repositories/transaction.repository.ts` | Drop `paymentProducer` dep and the `removeJob` call.                                        |
| `libs/constants/src/lib/payment.constant.ts`                                                       | Remove `PAYMENT_QUEUE_NAME`, `CANCEL_PAYMENT_JOB_NAME`.                                     |
| `libs/utils/src/lib/bullmq.util.ts`                                                                | Delete file. Prune from `libs/utils/src/index.ts` if re-exported.                           |
| `package.json`                                                                                     | Remove `@nestjs/bullmq` and `bullmq` from `dependencies`. Re-run install.                   |
| `apps/webs/customer-web/src/app/payment/qr/[paymentId]/QrPaymentClient.tsx`                        | Add paid-state UI; SSE updates local state instead of redirecting.                          |
| `apps/webs/customer-web/next.config.js`                                                            | Keep `images.remotePatterns` entry for `api.vietqr.io` (already applied).                   |

Do not touch any other file. SSE wiring in `customer-bff` (`PaymentStreamService`, `TransactionController`) is not modified.

## Correctness Properties

- **P1 (Redirect)** — For every order with `paymentMethod ∈ {ONLINE, WALLET}`, the frontend MUST navigate to `/payment/qr/:paymentId`. COD MUST go directly to the success screen.
- **P2 (QR Generation)** — For every payment with `method ∈ {ONLINE, WALLET}`, `getOne` MUST return a non-null `qrCode` URL pointing at `api.vietqr.io`. COD MUST return `qrCode: undefined`.
- **P3 (No BullMQ)** — The repository MUST contain zero references to `@nestjs/bullmq`, `bullmq`, `BullModule`, `PaymentProducer`, `PaymentQueue`, `PAYMENT_QUEUE_NAME`, `CANCEL_PAYMENT_JOB_NAME`, `generateCancelPaymentJobId`, `generateProcessVideoJobId`, or `paymentProducer`. `package.json#dependencies` MUST NOT list `@nestjs/bullmq` or `bullmq`.
- **P4 (COD Unchanged)** — For every input with `paymentMethod === 'COD'`, behavior before and after the fix MUST be identical at every call site.
- **P5 (`next/image` allowlist)** — `apps/webs/customer-web/next.config.js` MUST include `images.remotePatterns` with `{ protocol: 'https', hostname: 'api.vietqr.io', pathname: '/**' }` and no other unrelated host.
- **P6 (Paid UI)** — For every render of `QrPaymentClient` where the local status is `SUCCESS`, the DOM MUST include the "Đã thanh toán" card and MUST NOT include the QR `<img>` element.
- **P7 (SSE update in place)** — When the `EventSource` receives `{ data: { paymentId: <currentId>, userId: <currentUser> } }`, the client MUST update local status to `SUCCESS`; it MUST NOT call `router.push` or `router.replace`.
- **P8 (Webhook → SSE unchanged)** — `TransactionController#receiver` MUST still call `paymentStreamService.publish(result)` with the `{ paymentCode, paymentId, userId, message }` envelope after a successful webhook.

## Regression Prevention

- COD flow unchanged at frontend and backend.
- Webhook handler still atomically writes the transaction row, updates the payment to `SUCCESS`, and returns the envelope used by SSE.
- Payment listing, deletion, status update (non-webhook), and other non-payment flows untouched.
- `NotificationBell` SSE stream is independent and must keep working.
- `ms` package and `@keyv/redis`, `cache-manager`, etc., are untouched.
