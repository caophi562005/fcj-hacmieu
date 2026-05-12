# Order Status Display Fix - Bugfix Design

## Overview

Hàm `statusLabel()` trong cả trang danh sách đơn hàng (`/profile/orders`) và trang chi tiết đơn hàng (`/profile/orders/:id`) luôn trả về "Chờ thanh toán" cho mọi đơn hàng có status PENDING. Thực tế, PENDING nghĩa là "Chờ xác nhận" (đã thanh toán, đang chờ shop xác nhận). Chỉ trường hợp đặc biệt khi `paymentMethod=WALLET` AND `paymentStatus=PENDING` mới nên hiển thị "Chờ thanh toán".

Fix approach: Thay đổi `statusLabel()` để nhận thêm context (paymentMethod, paymentStatus), cập nhật TABS label, điều kiện hiển thị nút "Thanh toán", và timeline stepper.

## Glossary

- **Bug_Condition (C)**: Điều kiện kích hoạt bug — khi order status là PENDING nhưng KHÔNG phải trường hợp wallet-pending-payment (paymentMethod=WALLET AND paymentStatus=PENDING), hệ thống vẫn hiển thị sai label "Chờ thanh toán"
- **Property (P)**: Hành vi mong muốn — hiển thị "Chờ xác nhận" cho PENDING orders đã thanh toán, "Chờ thanh toán" chỉ khi paymentMethod=WALLET AND paymentStatus=PENDING
- **Preservation**: Hành vi hiện tại của các status khác (CREATING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED, REFUNDED) phải giữ nguyên
- **statusLabel()**: Hàm trong `page.tsx` (cả list và detail) chuyển đổi order status sang label tiếng Việt
- **OrderStatusValues**: Enum constants trong `libs/constants/src/lib/order.constant.ts`
- **PaymentMethodValues**: Enum constants trong `libs/constants/src/lib/payment.constant.ts`
- **PaymentStatusValues**: Enum constants trong `libs/constants/src/lib/payment.constant.ts`

## Bug Details

### Bug Condition

Bug xảy ra khi order có status PENDING nhưng đã thanh toán xong (paymentStatus=SUCCESS) hoặc dùng phương thức thanh toán khác WALLET (COD, ONLINE). Hàm `statusLabel()` chỉ nhận tham số `status` nên không có đủ context để phân biệt giữa "chờ thanh toán" và "chờ xác nhận".

**Formal Specification:**

```
FUNCTION isBugCondition(input)
  INPUT: input of type { status: string, paymentMethod: string, paymentStatus: string }
  OUTPUT: boolean

  RETURN input.status = "PENDING"
         AND NOT (input.paymentMethod = "WALLET" AND input.paymentStatus = "PENDING")
END FUNCTION
```

### Examples

- Order PENDING + paymentMethod=COD + paymentStatus=PENDING → Hiện tại: "Chờ thanh toán" ❌ → Mong muốn: "Chờ xác nhận" ✅
- Order PENDING + paymentMethod=WALLET + paymentStatus=SUCCESS → Hiện tại: "Chờ thanh toán" ❌ → Mong muốn: "Chờ xác nhận" ✅
- Order PENDING + paymentMethod=ONLINE + paymentStatus=SUCCESS → Hiện tại: "Chờ thanh toán" ❌ → Mong muốn: "Chờ xác nhận" ✅
- Order PENDING + paymentMethod=WALLET + paymentStatus=PENDING → Hiện tại: "Chờ thanh toán" ✅ → Mong muốn: "Chờ thanh toán" ✅ (giữ nguyên)
- Tab PENDING trên trang list → Hiện tại: "Chờ thanh toán" ❌ → Mong muốn: "Chờ xác nhận" ✅
- Nút "Thanh toán" hiện cho mọi PENDING order → Mong muốn: chỉ hiện khi paymentMethod=WALLET AND paymentStatus=PENDING

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- Tất cả status khác PENDING (CREATING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED, REFUNDED) giữ nguyên label
- Nút "Mua lại" vẫn hiển thị cho COMPLETED orders
- Badge styling (STATUS_BADGE) cho mỗi status giữ nguyên
- Layout, pagination, search, và navigation giữ nguyên
- Payment info section trong detail page giữ nguyên
- Timeline stepper cho các status khác PENDING giữ nguyên

**Scope:**
Tất cả inputs KHÔNG liên quan đến order status PENDING sẽ hoàn toàn không bị ảnh hưởng bởi fix này. Bao gồm:

- Orders với status CREATING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED, REFUNDED
- Mouse clicks, navigation, pagination
- Search functionality
- Order detail sections (address, payment info, product list, summary)

## Hypothesized Root Cause

Based on the bug analysis, the root causes are:

1. **statusLabel() thiếu context**: Hàm `statusLabel(status: string)` chỉ nhận 1 tham số `status`, không có thông tin về `paymentMethod` và `paymentStatus` để phân biệt giữa "chờ thanh toán" và "chờ xác nhận"

2. **TABS array hardcoded sai label**: Mảng `TABS` trong order list page hardcode label "Chờ thanh toán" cho tab `pending`, trong khi đúng ra phải là "Chờ xác nhận" (vì tab filter theo order status, không phải payment status)

3. **Nút "Thanh toán" điều kiện quá rộng**: Điều kiện `o.status === OrderStatusValues.PENDING` cho nút "Thanh toán" không kiểm tra paymentMethod và paymentStatus, dẫn đến hiển thị nút cho cả orders đã thanh toán xong

4. **Timeline stepper dùng cùng statusLabel()**: Timeline trong detail page gọi `statusLabel(step.status)` mà không truyền context payment, nên cũng hiển thị sai

## Correctness Properties

Property 1: Bug Condition - Context-Aware PENDING Label

_For any_ order where status is PENDING AND NOT (paymentMethod=WALLET AND paymentStatus=PENDING), the fixed statusLabel function SHALL return "Chờ xác nhận" and the "Thanh toán" button SHALL NOT be visible.

**Validates: Requirements 2.2, 2.3, 2.4**

Property 2: Preservation - Non-PENDING Status Labels Unchanged

_For any_ order where status is NOT PENDING (CREATING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED, REFUNDED), the fixed statusLabel function SHALL produce the same result as the original function, preserving all existing label mappings and button visibility logic.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `apps/webs/customer-web/src/app/profile/orders/page.tsx`

**Changes**:

1. **Update TABS label**: Đổi `{ key: 'pending', label: 'Chờ thanh toán' }` thành `{ key: 'pending', label: 'Chờ xác nhận' }`

2. **Update statusLabel() signature**: Thêm optional params `paymentMethod` và `paymentStatus`
   - Khi status=PENDING AND paymentMethod=WALLET AND paymentStatus=PENDING → return "Chờ thanh toán"
   - Khi status=PENDING (các trường hợp khác) → return "Chờ xác nhận"
   - Các status khác giữ nguyên

3. **Update statusLabel() call sites**: Truyền thêm `o.paymentMethod` và `o.paymentStatus` khi gọi `statusLabel(o.status, o.paymentMethod, o.paymentStatus)`

4. **Update nút "Thanh toán" condition**: Đổi từ `o.status === OrderStatusValues.PENDING` thành `o.status === OrderStatusValues.PENDING && o.paymentMethod === PaymentMethodValues.WALLET && o.paymentStatus === PaymentStatusValues.PENDING`

5. **Import thêm constants**: Import `PaymentMethodValues` và `PaymentStatusValues` từ `@common/constants/payment.constant`

---

**File**: `apps/webs/customer-web/src/app/profile/orders/[id]/page.tsx`

**Changes**:

1. **Update statusLabel() signature**: Tương tự như trên, thêm optional params

2. **Update statusLabel() call trong badge**: Truyền `order.paymentMethod` và `order.paymentStatus`

3. **Update statusLabel() call trong timeline**: Truyền `order.paymentMethod` và `order.paymentStatus` cho timeline step khi `step.status === OrderStatusValues.PENDING`

## Testing Strategy

### Validation Approach

Testing strategy theo hai giai đoạn: đầu tiên surface counterexamples trên code chưa fix để xác nhận root cause, sau đó verify fix hoạt động đúng và preserve hành vi hiện tại.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples chứng minh bug TRƯỚC KHI implement fix. Xác nhận hoặc bác bỏ root cause analysis.

**Test Plan**: Render component với các order có status PENDING kết hợp với các paymentMethod/paymentStatus khác nhau, assert label hiển thị. Chạy trên code CHƯA FIX để observe failures.

**Test Cases**:

1. **COD PENDING Order**: Render order với status=PENDING, paymentMethod=COD, paymentStatus=PENDING → expect "Chờ xác nhận" (will fail on unfixed code, shows "Chờ thanh toán")
2. **WALLET SUCCESS Order**: Render order với status=PENDING, paymentMethod=WALLET, paymentStatus=SUCCESS → expect "Chờ xác nhận" (will fail on unfixed code)
3. **ONLINE SUCCESS Order**: Render order với status=PENDING, paymentMethod=ONLINE, paymentStatus=SUCCESS → expect "Chờ xác nhận" (will fail on unfixed code)
4. **Payment Button Visibility**: Render order với status=PENDING, paymentMethod=COD → expect nút "Thanh toán" NOT visible (will fail on unfixed code)

**Expected Counterexamples**:

- statusLabel() returns "Chờ thanh toán" cho mọi PENDING order bất kể payment context
- Nút "Thanh toán" hiển thị cho mọi PENDING order
- Root cause: statusLabel() chỉ nhận `status` string, không có payment context

### Fix Checking

**Goal**: Verify rằng cho mọi input thỏa bug condition, hàm fixed trả về kết quả đúng.

**Pseudocode:**

```
FOR ALL input WHERE isBugCondition(input) DO
  result := statusLabel_fixed(input.status, input.paymentMethod, input.paymentStatus)
  ASSERT result = "Chờ xác nhận"
  ASSERT paymentButton_visible(input) = false
END FOR
```

### Preservation Checking

**Goal**: Verify rằng cho mọi input KHÔNG thỏa bug condition, hàm fixed trả về cùng kết quả với hàm gốc.

**Pseudocode:**

```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT statusLabel_original(input.status) = statusLabel_fixed(input.status, input.paymentMethod, input.paymentStatus)
END FOR
```

**Testing Approach**: Property-based testing recommended cho preservation checking vì:

- Tự động generate nhiều test cases across input domain
- Catch edge cases mà manual unit tests có thể miss
- Đảm bảo strong guarantees rằng behavior unchanged cho mọi non-buggy inputs

**Test Plan**: Observe behavior trên code CHƯA FIX cho các status khác PENDING, sau đó viết property-based tests capturing behavior đó.

**Test Cases**:

1. **Non-PENDING Status Preservation**: Verify statusLabel cho CREATING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED, REFUNDED giữ nguyên
2. **WALLET PENDING Preservation**: Verify order PENDING + WALLET + paymentStatus=PENDING vẫn hiển thị "Chờ thanh toán" và nút "Thanh toán"
3. **Buy Again Button Preservation**: Verify nút "Mua lại" vẫn hiển thị cho COMPLETED orders
4. **Badge Styling Preservation**: Verify STATUS_BADGE classes không thay đổi

### Unit Tests

- Test statusLabel() với mỗi combination của status + paymentMethod + paymentStatus
- Test TABS array có đúng label "Chờ xác nhận" cho pending tab
- Test nút "Thanh toán" visibility logic với các scenarios
- Test timeline stepper hiển thị đúng label theo context

### Property-Based Tests

- Generate random orders với status=PENDING và random paymentMethod/paymentStatus combinations, verify label logic đúng
- Generate random orders với status≠PENDING, verify statusLabel output giữ nguyên so với original
- Generate random order lists, verify nút "Thanh toán" chỉ hiện đúng điều kiện

### Integration Tests

- Test full flow: navigate to order list → verify tab label → click vào order PENDING (COD) → verify detail page hiển thị "Chờ xác nhận"
- Test full flow: navigate to order list → verify nút "Thanh toán" chỉ hiện cho WALLET+PENDING orders
- Test timeline stepper hiển thị đúng label trong context của full order detail page
