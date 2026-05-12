# Bugfix Requirements Document

## Introduction

UI trang `/profile/orders` và `/profile/orders/:id` hiển thị sai trạng thái đơn hàng khi order status là PENDING. Hiện tại, hàm `statusLabel()` luôn trả về "Chờ thanh toán" cho mọi đơn hàng PENDING, trong khi đúng ra PENDING nghĩa là "Chờ xác nhận" (đã thanh toán xong, đang chờ shop xác nhận). Chỉ trường hợp đặc biệt PENDING + paymentMethod=WALLET + paymentStatus=PENDING mới nên hiển thị "Chờ thanh toán". Ngoài ra, tab filter cũng ghi sai label "Chờ thanh toán" thay vì "Chờ xác nhận".

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN order status là PENDING AND paymentMethod=WALLET AND paymentStatus=PENDING THEN hệ thống hiển thị "Chờ thanh toán" — đúng nhưng trùng với mọi trường hợp PENDING khác nên không phân biệt được

1.2 WHEN order status là PENDING AND (paymentStatus=SUCCESS HOẶC paymentMethod≠WALLET) THEN hệ thống vẫn hiển thị "Chờ thanh toán" thay vì "Chờ xác nhận"

1.3 WHEN người dùng xem tab filter trên trang /profile/orders THEN tab cho trạng thái PENDING hiển thị label "Chờ thanh toán" thay vì "Chờ xác nhận"

1.4 WHEN order status là PENDING AND (paymentStatus=SUCCESS HOẶC paymentMethod≠WALLET) THEN hệ thống vẫn hiển thị nút "Thanh toán" trên trang danh sách đơn hàng

1.5 WHEN người dùng xem timeline stepper trên trang chi tiết đơn hàng /profile/orders/:id THEN timeline step cho PENDING hiển thị "Chờ thanh toán" thay vì "Chờ xác nhận"

### Expected Behavior (Correct)

2.1 WHEN order status là PENDING AND paymentMethod=WALLET AND paymentStatus=PENDING THEN hệ thống SHALL hiển thị "Chờ thanh toán" và hiện nút "Thanh toán"

2.2 WHEN order status là PENDING AND (paymentStatus=SUCCESS HOẶC paymentMethod≠WALLET) THEN hệ thống SHALL hiển thị "Chờ xác nhận" và KHÔNG hiện nút "Thanh toán"

2.3 WHEN người dùng xem tab filter trên trang /profile/orders THEN tab cho trạng thái PENDING SHALL hiển thị label "Chờ xác nhận"

2.4 WHEN người dùng xem timeline stepper trên trang chi tiết đơn hàng /profile/orders/:id với order PENDING THEN timeline step SHALL hiển thị đúng label theo logic: "Chờ thanh toán" nếu paymentMethod=WALLET AND paymentStatus=PENDING, ngược lại "Chờ xác nhận"

### Unchanged Behavior (Regression Prevention)

3.1 WHEN order status là CREATING THEN hệ thống SHALL CONTINUE TO hiển thị "Đang tạo"

3.2 WHEN order status là CONFIRMED THEN hệ thống SHALL CONTINUE TO hiển thị "Chờ giao hàng"

3.3 WHEN order status là SHIPPING THEN hệ thống SHALL CONTINUE TO hiển thị "Đang giao"

3.4 WHEN order status là COMPLETED THEN hệ thống SHALL CONTINUE TO hiển thị "Hoàn thành"

3.5 WHEN order status là CANCELLED THEN hệ thống SHALL CONTINUE TO hiển thị "Đã hủy"

3.6 WHEN order status là REFUNDED THEN hệ thống SHALL CONTINUE TO hiển thị "Đã hoàn tiền"

3.7 WHEN order status là COMPLETED THEN hệ thống SHALL CONTINUE TO hiển thị nút "Mua lại"

3.8 WHEN order status là PENDING AND paymentMethod=WALLET AND paymentStatus=PENDING THEN hệ thống SHALL CONTINUE TO hiển thị nút "Thanh toán" (hành vi đúng hiện tại cần giữ nguyên)

---

## Bug Condition (Formal)

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type Order
  OUTPUT: boolean

  // Bug triggers when order is PENDING but NOT in the wallet-pending-payment case
  RETURN X.status = "PENDING" AND NOT (X.paymentMethod = "WALLET" AND X.paymentStatus = "PENDING")
END FUNCTION
```

```pascal
// Property: Fix Checking - Correct label for non-wallet-pending PENDING orders
FOR ALL X WHERE isBugCondition(X) DO
  label ← statusLabel'(X)
  ASSERT label = "Chờ xác nhận"
  ASSERT paymentButton_visible(X) = false
END FOR
```

```pascal
// Property: Preservation Checking - Non-buggy inputs unchanged
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT statusLabel(X) = statusLabel'(X)
END FOR
```
