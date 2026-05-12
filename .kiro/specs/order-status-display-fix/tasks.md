# Implementation Plan

- [x] 1. Fix order list page (`apps/webs/customer-web/src/app/profile/orders/page.tsx`)
  - [x] 1.1 Import PaymentMethodValues and PaymentStatusValues from `@common/constants/payment.constant`
    - _Requirements: 2.1, 2.2_

  - [x] 1.2 Update TABS label for 'pending' from "Chờ thanh toán" to "Chờ xác nhận"
    - Change `{ key: 'pending', label: 'Chờ thanh toán' }` → `{ key: 'pending', label: 'Chờ xác nhận' }`
    - _Requirements: 2.3_

  - [x] 1.3 Update statusLabel() to accept optional paymentMethod and paymentStatus params
    - New signature: `statusLabel(status: string, paymentMethod?: string, paymentStatus?: string)`
    - When status=PENDING AND paymentMethod=WALLET AND paymentStatus=PENDING → return "Chờ thanh toán"
    - When status=PENDING otherwise → return "Chờ xác nhận"
    - All other statuses unchanged
    - _Bug_Condition: isBugCondition(input) where input.status="PENDING" AND NOT (input.paymentMethod="WALLET" AND input.paymentStatus="PENDING")_
    - _Expected_Behavior: return "Chờ xác nhận" for bug condition inputs_
    - _Preservation: Non-PENDING statuses return same labels as before_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 1.4 Update statusLabel() call site in order card badge to pass payment context
    - Change `statusLabel(o.status)` → `statusLabel(o.status, o.paymentMethod, o.paymentStatus)`
    - _Requirements: 2.1, 2.2_

  - [x] 1.5 Update "Thanh toán" button condition to check payment context
    - Change `o.status === OrderStatusValues.PENDING` → `o.status === OrderStatusValues.PENDING && o.paymentMethod === PaymentMethodValues.WALLET && o.paymentStatus === PaymentStatusValues.PENDING`
    - _Requirements: 2.1, 2.2_

- [x] 2. Fix order detail page (`apps/webs/customer-web/src/app/profile/orders/[id]/page.tsx`)
  - [x] 2.1 Update statusLabel() to accept optional paymentMethod and paymentStatus params
    - Same logic as task 1.3
    - When status=PENDING AND paymentMethod=WALLET AND paymentStatus=PENDING → return "Chờ thanh toán"
    - When status=PENDING otherwise → return "Chờ xác nhận"
    - All other statuses unchanged
    - _Bug_Condition: isBugCondition(input) where input.status="PENDING" AND NOT (input.paymentMethod="WALLET" AND input.paymentStatus="PENDING")_
    - _Expected_Behavior: return "Chờ xác nhận" for bug condition inputs_
    - _Preservation: Non-PENDING statuses return same labels as before_
    - _Requirements: 2.1, 2.2, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 2.2 Update statusLabel() call in order status badge to pass payment context
    - Change `statusLabel(order.status)` → `statusLabel(order.status, order.paymentMethod, order.paymentStatus)`
    - _Requirements: 2.1, 2.2_

  - [x] 2.3 Update statusLabel() call in timeline stepper to pass payment context
    - For timeline steps, pass `order.paymentMethod` and `order.paymentStatus` when rendering step labels
    - Change `statusLabel(step.status)` → `statusLabel(step.status, order.paymentMethod, order.paymentStatus)`
    - _Requirements: 2.4_

- [x] 3. Verify build passes
  - Run `npx nx build customer-web` or equivalent lint/type-check command
  - Ensure no TypeScript errors from updated function signatures
  - Ensure no import errors from new constants
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
