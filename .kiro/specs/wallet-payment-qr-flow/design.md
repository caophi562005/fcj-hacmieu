# Wallet Payment QR Flow — Simplified Design (Keep SSE, Drop BullMQ)

## Overview

Scope has shrunk from the original spec. The feature now consists of three clean concerns:

1. WALLET goes through the same QR flow as ONLINE (already patched in `PaymentView.tsx` and `payment.service.ts#getOne`).
2. The QR page at `/payment/qr/:paymentId` shows one of two UIs: "Đã thanh toán" if the payment is already `SUCCESS`, otherwise the VietQR card. When the payment becomes `SUCCESS` during the session, the existing SSE channel flips the UI in place. No countdown, no auto-cancel, no BullMQ.
3. All BullMQ infrastructure for payments is removed: producer, queue processor, module wiring, constants, utility helpers, and npm packages. The unused `generateProcessVideoJobId` helper is removed at the same time.

The SSE stack stays intact. It is already decoupled from BullMQ:

```
webhook → transaction.controller.ts → paymentService.receiver
       → transaction.repository.ts updates payment.status = SUCCESS
       → transaction.controller.ts calls paymentStreamService.publish(result)
       → /payment/transaction/sse filters by userId and emits MessageEvent
       → customer-web /api/payment/sse proxies with Bearer auth
       → QrPaymentClient's EventSource updates local state to SUCCESS
```

None of those edges touch BullMQ, so removal is a pure subtraction.

## Glossary

- **Bug Condition (C)**: the aggregate defects listed in `bugfix.md` (dead BullMQ code, missing paid-state UI, wrong SSE behavior, unused packages).
- **Preservation**: COD flow, webhook handler's persistence and envelope, SSE stack, payment listing, and all non-payment flows stay unchanged.
- **BFF get-payment endpoint**: `GET /payment/payment/:paymentId` consumed by `getMyPaymentById` in `apps/webs/customer-web/src/lib/payment.ts`.
- **Paid state**: `payment.status === 'SUCCESS'`.
- **SSE stack**: `TransactionController` + `PaymentStreamService` in `customer-bff`, `/api/payment/sse` proxy in `customer-web`, `EventSource('/api/payment/sse')` in `QrPaymentClient`.

## Bug Details

### Bug Condition

```
FUNCTION isBugCondition(state)
  INPUT: state describes runtime/repo state
  OUTPUT: boolean

  RETURN
       state.repo.hasBullMqPaymentCode        // any of: producer/queue files, BullModule wiring, constants, paymentProducer usages
    OR state.repo.hasBullMqPackages            // @nestjs/bullmq or bullmq in package.json
    OR state.repo.hasDeadBullMqUtil            // libs/utils/src/lib/bullmq.util.ts exists
    OR state.payment.status === 'SUCCESS' AND state.qrPage.uiVariant !== 'ALREADY_PAID'
    OR state.sse.onSuccessEvent === 'navigate' // should be 'updateLocalState'
    OR state.nextImage.blocks('api.vietqr.io')
END FUNCTION
```

### Examples

- `grep -R "PAYMENT_QUEUE_NAME" apps libs` returns matches → C(X).
- `grep -E '"(@nestjs/bullmq|bullmq)"' package.json` returns matches → C(X).
- `libs/utils/src/lib/bullmq.util.ts` exists → C(X).
- Rendering `QrPaymentClient` with `payment.status === 'SUCCESS'` produces the QR card → C(X).
- SSE event for the current payment redirects the user instead of updating the card → C(X).

## Expected Behavior

### Preservation Requirements

- COD redirect and success screen behavior identical.
- `payment.service.ts#getOne` signature and return shape unchanged for COD.
- `transaction.repository.ts#receiver` still writes the transaction, updates the payment to `SUCCESS`, and returns `{ paymentCode, paymentId, userId, message }`.
- `TransactionController#receiver` still calls `paymentStreamService.publish(result)` after success.
- `/payment/transaction/sse` stream behavior unchanged (filter by `userId`, emit `MessageEvent`).
- `NotificationBell` SSE stream unaffected.
- `ms`, `@keyv/redis`, `cache-manager`, and all non-BullMQ packages untouched.

### Scope

Only the files listed in `bugfix.md#affected-files` change. Any other edit is out of scope.

## Hypothesized Root Cause

Confirmed:

1. The BullMQ cancel-payment job was the only consumer of `PaymentProducer`, `PaymentQueue`, the constants, and the `generateCancelPaymentJobId` helper. Dropping the product requirement makes everything in this chain dead.
2. `generateProcessVideoJobId` has zero importers (grep verified). It was shipped as a sibling helper of the payment helper but no video pipeline ever consumed it.
3. `@nestjs/bullmq` and `bullmq` packages are imported exclusively from the two payment queue files. With those files gone the packages are unused.
4. `QrPaymentClient.tsx` was designed when the page was tied to a timeout. The `router.replace('/profile/orders')` on SSE success reflects that old model and no longer matches the desired UX.

## Correctness Properties

Property 1 — WALLET redirect (Requirements 2.1)
For every `handleCreateOrder` call with `paymentMethod === 'WALLET'` producing a valid `paymentId`, `router.push('/payment/qr/${paymentId}')` MUST be invoked.

Property 2 — WALLET QR URL (Requirements 2.2)
For every `getOne` call with `payment.method ∈ {ONLINE, WALLET}`, the response MUST include a `qrCode` matching `https://api.vietqr.io/${BANK_CODE}/${BANK_NUMBER}/${amount}/${code}.png`.

Property 3 — No BullMQ (Requirements 2.3, new)
Static repository invariants:

- `apps/services/payment-service/src/app/modules/payment/producers` and `queues` directories do not exist.
- No file imports from `'@nestjs/bullmq'` or `'bullmq'`.
- No file references `PaymentProducer`, `PaymentQueue`, `PAYMENT_QUEUE_NAME`, `CANCEL_PAYMENT_JOB_NAME`, `generateCancelPaymentJobId`, `generateProcessVideoJobId`, or `paymentProducer`.
- `libs/utils/src/lib/bullmq.util.ts` does not exist; any re-export from `libs/utils/src/index.ts` is pruned.
- `package.json#dependencies` contains neither `@nestjs/bullmq` nor `bullmq`.

Property 4 — COD unchanged (Requirements 3.1–3.4)
For every input with `paymentMethod === 'COD'`, frontend and backend behavior before and after the change MUST be identical.

Property 5 — `next/image` allowlist (Requirements 4.1)
`apps/webs/customer-web/next.config.js` MUST include `images.remotePatterns` with `{ protocol: 'https', hostname: 'api.vietqr.io', pathname: '/**' }`.

Property 6 — Paid UI (Requirements 5.1, new)
For every render of `QrPaymentClient` where local `status === 'SUCCESS'`, the rendered DOM MUST contain the "Đã thanh toán" card and MUST NOT contain the QR `<img>` element.

Property 7 — SSE updates in place (Requirements 5.2, new)
When `EventSource('/api/payment/sse')` receives an event with `data.paymentId === currentPaymentId`, the client MUST set local status to `SUCCESS`. It MUST NOT call `router.push`, `router.replace`, or any navigation API.

Property 8 — Webhook → SSE unchanged (Requirements 6.1, new)
`TransactionController#receiver` MUST still publish the webhook's `{ paymentCode, paymentId, userId, message }` envelope via `paymentStreamService.publish(result)`, and the webhook's status update path MUST still mark the payment as `SUCCESS`.

## Fix Implementation

### Frontend — `PaymentView.tsx`

Already in the target state. No change.

```typescript
if (paymentMethod === 'ONLINE' || paymentMethod === 'WALLET') {
  router.push(`/payment/qr/${res.paymentId}`);
  return;
}
setIsOrderSuccess(true);
```

### Backend — `payment.service.ts`

`getOne` unchanged. `create` simplified:

```typescript
@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async create({ processId, ...data }: CreatePaymentRequest): Promise<PaymentResponse> {
    return this.paymentRepository.create(data);
  }
  // getOne, list, updateStatus, delete unchanged
}
```

### Backend — `payment.module.ts`

Final shape:

```typescript
@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.ORDER_SERVICE)]),
    SqsModule.register({
      /* unchanged */
    }),
  ],
  controllers: [PaymentGrpcController],
  providers: [PaymentRepository, PaymentService, PaymentConsumerService],
  exports: [],
})
export class PaymentModule {}
```

Remove: `@nestjs/bullmq` import, `PAYMENT_QUEUE_NAME` import, `PaymentProducer`, `PaymentQueue`, `BullModule.registerQueue`. Keep: SQS consumer for `CREATE_PAYMENT_QUEUE_NAME` and gRPC controller.

### Backend — `transaction.repository.ts`

Final `receiver` body preserves everything except the `removeJob` call:

```typescript
return await this.prismaService.$transaction(async (tx) => {
  await tx.transaction.create({
    /* unchanged */
  });
  const payment = await tx.payment.findUnique({ where: { code: paymentCode } });
  if (!payment) throw new NotFoundException('Error.PaymentNotFound');
  if (payment.amount !== data.transferAmount) throw new BadRequestException('Error.AmountPriceMismatch');
  await tx.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatusValues.SUCCESS },
  });
  return { paymentCode, paymentId: payment.id, userId: payment.userId, message: 'Message.ReceivedSuccessfully' };
});
```

Constructor signature drops `paymentProducer`. Also drop the `PaymentProducer` import.

### Backend — delete files

- `apps/services/payment-service/src/app/modules/payment/producers/payment.producer.ts`
- `apps/services/payment-service/src/app/modules/payment/queues/payment.queue.ts`

### Shared libs

- `libs/constants/src/lib/payment.constant.ts`: remove `PAYMENT_QUEUE_NAME` and `CANCEL_PAYMENT_JOB_NAME`. Keep enums and types.
- `libs/utils/src/lib/bullmq.util.ts`: delete file. If re-exported from `libs/utils/src/index.ts` or `libs/utils/src/lib/index.ts`, remove the re-export.

### `package.json`

Remove `"@nestjs/bullmq": "^11.0.4"` and `"bullmq": "^5.73.0"` from `dependencies`. Run `pnpm install` so `pnpm-lock.yaml` is in sync. Do not re-order unrelated dependencies.

### Frontend — `QrPaymentClient.tsx`

Final structure:

```tsx
'use client';

import type { GetPaymentResponse } from '@common/interfaces/models/payment';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = { payment: GetPaymentResponse };

type PaymentSseEnvelope = {
  type?: string;
  data?: { userId?: string; paymentId?: string; paymentCode?: string; message?: string };
};

export function QrPaymentClient({ payment }: Props) {
  const [status, setStatus] = useState(payment.status);
  const isPaid = status === 'SUCCESS';

  useEffect(() => {
    if (isPaid) return;
    const es = new EventSource('/api/payment/sse');
    const onMessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as PaymentSseEnvelope;
        if (payload?.data?.paymentId !== payment.id) return;
        setStatus('SUCCESS');
      } catch {
        // ignore
      }
    };
    es.addEventListener('message', onMessage as EventListener);
    return () => {
      es.removeEventListener('message', onMessage as EventListener);
      es.close();
    };
  }, [isPaid, payment.id]);

  if (isPaid) {
    return (
      <div className="card p-8 text-center max-w-xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-5">
          <CheckCircle2 className="w-11 h-11 text-success" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold mb-2">Bạn đã thanh toán đơn này rồi</h1>
        <p className="text-sm text-ink-muted mb-6">
          Mã thanh toán <span className="font-medium text-ink">{payment.code}</span> đã được ghi nhận.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link href="/" className="btn-outline btn-lg w-full cursor-pointer">
            Trang chủ
          </Link>
          <Link href="/profile/orders" className="btn-primary btn-lg w-full cursor-pointer">
            Đơn mua
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="card p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Thanh toán QR</h1>
        <p className="text-sm text-ink-muted">
          Mã thanh toán: <span className="font-medium text-ink">{payment.code}</span>
        </p>
        <p className="text-sm text-ink-muted mt-1">Trạng thái: Chờ thanh toán</p>
      </div>

      <div className="card p-6 text-center">
        {payment.qrCode ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={payment.qrCode} alt="QR thanh toán" className="w-72 h-72 max-w-full mx-auto rounded border border-border-subtle" />
        ) : (
          <p className="text-sm text-ink-muted">Không có mã QR cho phương thức này.</p>
        )}
        <p className="text-xs text-ink-subtle mt-3">Hệ thống sẽ tự cập nhật khi giao dịch thành công.</p>
      </div>

      <div className="flex gap-3">
        <Link href="/profile/orders" className="btn-outline btn-md w-full text-center cursor-pointer">
          Đơn mua
        </Link>
        <Link href="/" className="btn-primary btn-md w-full text-center cursor-pointer">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
```

Key diffs from current: remove `useRouter`, remove `useMemo`, add `status` state seeded from `payment.status`, on SSE match call `setStatus('SUCCESS')` instead of `router.replace('/profile/orders')`, add the paid-state branch.

### Frontend — `next.config.js`

Already contains the `images.remotePatterns` entry for `api.vietqr.io`. No further change.

## Testing Strategy

### Validation Approach

1. Record the current repo state (grep matches, package dependencies, SSE wiring) as baseline.
2. Apply the fix in the order listed in `tasks.md`.
3. Verify the new static invariants (zero BullMQ references, removed packages).
4. Verify runtime behavior: WALLET redirect, QR render, SSE update in place, paid-state UI on refresh, COD unchanged.

### Exploratory Bug Condition Checking

Static checks (expected to FAIL on current code):

1. `grep -E "@nestjs/bullmq|\"bullmq\":" package.json` → expect zero matches. FAILS now.
2. `grep -R "PaymentProducer\|PaymentQueue\|PAYMENT_QUEUE_NAME\|CANCEL_PAYMENT_JOB_NAME" apps libs` → expect zero matches. FAILS now.
3. `ls apps/services/payment-service/src/app/modules/payment/producers` → expect "does not exist". FAILS now.
4. `ls libs/utils/src/lib/bullmq.util.ts` → expect "does not exist". FAILS now.
5. Render `QrPaymentClient({ payment: { status: 'SUCCESS', ... } })` → expect text "Bạn đã thanh toán đơn này rồi". FAILS now.
6. Static scan of `QrPaymentClient.tsx` → expect no `router.replace` or `router.push` in the SSE message handler. FAILS now.

### Fix Checking

Runtime properties to validate after the change:

```
FOR ALL payment WHERE method ∈ {ONLINE, WALLET}:
  ASSERT getOne(payment).qrCode MATCHES vietqr URL
  ASSERT create(payment) does NOT access any queue
  ASSERT frontend routes to `/payment/qr/${paymentId}`

FOR ALL payment WHERE status === 'SUCCESS':
  ASSERT QrPaymentClient renders "Đã thanh toán" card
  ASSERT no EventSource is opened (short-circuited by `isPaid`)

FOR SSE flow:
  GIVEN QrPaymentClient mounted for payment P with status='PENDING'
  WHEN webhook publishes { data: { paymentId: P.id, userId: P.userId } }
  THEN local status transitions to 'SUCCESS'
  AND DOM shows "Đã thanh toán" card
  AND router was NOT invoked
```

### Preservation Checking

```
FOR ALL payment WHERE method === 'COD':
  ASSERT getOne(payment).qrCode === undefined
  ASSERT create(payment) writes to repository only
  ASSERT frontend shows success screen, no QR page

FOR webhook success path:
  ASSERT transaction row created
  ASSERT payment.status set to 'SUCCESS'
  ASSERT response envelope = { paymentCode, paymentId, userId, message: 'Message.ReceivedSuccessfully' }
  ASSERT TransactionController.receiver called paymentStreamService.publish(envelope)
```

### Unit / Integration Tests

- `getOne` returns QR for WALLET and ONLINE; undefined for COD.
- `create` returns `paymentRepository.create(data)` regardless of method, no side effect.
- `transaction.repository.ts#receiver` matches the envelope shape, even without `paymentProducer`.
- `QrPaymentClient` render tests for `SUCCESS` vs `PENDING`.
- `QrPaymentClient` SSE test: mock `EventSource` to dispatch a matching message, assert status transitions to `SUCCESS` and DOM updates; assert router not called.

### Static Repo Checks (post-fix)

- `grep -R "@nestjs/bullmq\|'bullmq'\|\"bullmq\"" apps libs` → empty.
- `grep -R "PaymentProducer\|PaymentQueue\|PAYMENT_QUEUE_NAME\|CANCEL_PAYMENT_JOB_NAME\|generateCancelPaymentJobId\|generateProcessVideoJobId\|paymentProducer" apps libs` → empty.
- `test ! -e libs/utils/src/lib/bullmq.util.ts`.
- `test ! -e apps/services/payment-service/src/app/modules/payment/producers/payment.producer.ts`.
- `test ! -e apps/services/payment-service/src/app/modules/payment/queues/payment.queue.ts`.
- `package.json` parses and has no `@nestjs/bullmq` or `bullmq` entries.

### Build / Install Checks

- `pnpm install` completes without warnings about phantom dependencies.
- `pnpm nx build payment-service` passes.
- `pnpm nx build customer-bff` passes.
- `pnpm nx build customer-web` passes.

### Runtime Smoke

- WALLET order → redirected to `/payment/qr/:id`. QR renders (no `next/image` hostname error).
- Trigger webhook for that payment (via VietQR sandbox or manual POST to `/payment/transaction/receiver`). Browser receives SSE event, UI flips to "Đã thanh toán" without navigation.
- Refresh the same URL after success → "Đã thanh toán" card rendered immediately (no SSE needed).
- COD order → direct success screen.
