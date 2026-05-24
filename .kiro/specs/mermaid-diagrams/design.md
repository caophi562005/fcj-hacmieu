# V-Shop Mermaid Diagrams

## Overview

Tài liệu này định nghĩa toàn bộ các Mermaid diagram cần vẽ cho hệ thống V-Shop.
Mỗi diagram được phân loại theo type, syntax Mermaid tương ứng, và nội dung chi tiết.

---

## Diagram Types & Syntax Mapping

| Diagram Type      | Mermaid Syntax    | File                      |
| ----------------- | ----------------- | ------------------------- |
| Use Case          | `flowchart TD`    | `docs/diagrams/use-case/` |
| ERD               | `erDiagram`       | `docs/diagrams/erd/`      |
| Class Diagram     | `classDiagram`    | `docs/diagrams/class/`    |
| Activity Diagram  | `flowchart TD`    | `docs/diagrams/activity/` |
| Data Flow Diagram | `flowchart LR`    | `docs/diagrams/dfd/`      |
| Sequence Diagram  | `sequenceDiagram` | `docs/diagrams/sequence/` |

---

## 1. USE CASE DIAGRAMS (`flowchart TD`)

### UC-01: Customer Use Cases

**Actors:** Customer
**Use cases:**

- Đăng nhập / Đăng xuất (Cognito OIDC)
- Xem danh sách sản phẩm (public)
- Xem chi tiết sản phẩm + AI Review Summary
- Tìm kiếm / lọc sản phẩm
- Thêm vào giỏ hàng / Cập nhật / Xóa
- Đặt hàng (COD / WALLET / ONLINE QR)
- Theo dõi trạng thái đơn hàng
- Hủy đơn hàng
- Nạp xu V-Xu (QR VietQR)
- Dùng xu khi thanh toán
- Nhận / dùng voucher
- Viết đánh giá sản phẩm
- Chat 1-1 với shop
- Chat với AI Chatbot
- Xem thông báo (SSE)
- Xem lịch sử giao dịch ví
- Upload ảnh (S3 presigned URL)

### UC-02: Seller Use Cases

**Actors:** Seller
**Use cases:**

- Đăng ký Merchant (INDIVIDUAL / BUSINESS)
- Tạo / cập nhật Shop
- Tạo / sửa / xóa sản phẩm (+ SKU, variants, images)
- Upload video sản phẩm
- Xem / xử lý đơn hàng (CONFIRMED → SHIPPING → COMPLETED)
- Xem doanh thu (Shop Credit)
- Yêu cầu rút tiền (Payout)
- Trả lời đánh giá khách hàng
- Chat 1-1 với khách hàng
- Xem thống kê doanh thu

### UC-03: Admin Use Cases

**Actors:** Admin
**Use cases:**

- Quản lý User (xem, block, unblock)
- Duyệt / từ chối Merchant
- Quản lý sản phẩm (duyệt, ẩn, ban)
- Quản lý Promotion / Voucher
- Xem / xử lý Report (cảnh báo, ban, xóa)
- Duyệt Payout Request
- Quản lý Permissions (RBAC)
- Upload Knowledge Base cho AI Chatbot
- Xem tất cả đơn hàng / thanh toán / hoàn tiền

---

## 2. ERD DIAGRAMS (`erDiagram`)

### ERD-01: Order Service

**Models:** Order, OrderItem, Cart, CartItem
**Relations:**

- Order ||--o{ OrderItem : "has"
- Cart ||--o{ CartItem : "has"

### ERD-02: Payment Service

**Models:** Payment, Transaction, Refund
**Relations:**

- Payment ||--o{ Transaction : "matched by code"
- Payment ||--o{ Refund : "refunded via"

### ERD-03: Catalog Service

**Models:** Product, SKU, Category, Brand, Attribute
**Relations:**

- Product }o--|| Brand : "belongs to"
- Product }o--o{ Category : "tagged with"
- Product ||--o{ SKU : "has variants"

### ERD-04: IAM Service

**Models:** User, Permission
**Relations:** (standalone, no FK — userId referenced by other services)

### ERD-05: Shop Service

**Models:** Merchant, Shop
**Relations:**

- Merchant ||--|| Shop : "owns"

### ERD-06: Wallet Service

**Models:** Wallet, WalletTransaction, Credit, CreditTransaction, PayoutRequest
**Relations:**

- Wallet ||--o{ WalletTransaction : "records"
- Credit ||--o{ CreditTransaction : "records"
- Credit ||--o{ PayoutRequest : "requests"

### ERD-07: Utility Service

**Models:** Notification, Review, ReviewReply, RatingAggregate, Report, Video
**Relations:**

- Review ||--o| ReviewReply : "has reply"
- Review }o--|| RatingAggregate : "aggregated into"

### ERD-08: Promotion Service

**Models:** Promotion, Redemption
**Relations:**

- Promotion ||--o{ Redemption : "claimed by users"

### ERD-09: AI Service

**Models:** ReviewSummary
**Relations:** (standalone — productId references catalog-service)

---

## 3. CLASS DIAGRAMS (`classDiagram`)

### CLS-01: BFF Authentication Guard Chain

**Classes:** AuthenticationGuard, AccessTokenGuard, SepayHmacGuard, Auth (decorator)
**Relations:** AuthenticationGuard uses AccessTokenGuard, SepayHmacGuard via authTypeGuardMap

### CLS-02: Payment Domain

**Classes:** PaymentService, TransactionRepository, PaymentStreamService
**Methods:** createPayment, receiver, publish, stream
**Relations:** PaymentService → PaymentRepository, TransactionController → PaymentService + PaymentStreamService

### CLS-03: Order Domain

**Classes:** OrderService, CartService, OrderRepository
**Methods:** createOrder, validateCartItems, validateProducts, checkPromotion, calculateTotals
**Relations:** OrderService → CartService, OrderService → gRPC clients (catalog, wallet, promotion)

### CLS-04: Wallet Domain

**Classes:** WalletService, CreditService, PayoutService
**Methods:** getMyWallet, adjustWallet, adjustShopCredit, createShopPayout, updateShopPayoutStatus
**Enums:** WalletTransactionSource, CreditTransactionSource, PayoutStatus

### CLS-05: Catalog Domain

**Classes:** ProductService, SKUService, CategoryService, BrandService
**Methods:** getManyProducts, createProduct, validateProducts, updateProduct
**Enums:** ProductStatus

### CLS-06: Convex Chat Schema

**Classes:** conversations, conversationMembers, messages, botConversations, botKnowledgeBase
**Relations:** conversations ||--o{ conversationMembers, conversations ||--o{ messages

---

## 4. ACTIVITY DIAGRAMS (`flowchart TD`)

### ACT-01: Order Creation Activity

**Steps:**

1. Customer chọn items từ giỏ hàng
2. Nhập thông tin giao hàng + chọn payment method
3. [Optional] Nhập discount code → validate promotion
4. [Optional] Dùng V-Xu → check wallet balance
5. Validate cart items (stock, price)
6. Validate products với catalog-service
7. Tính toán: itemTotal, shippingFee, discount, grandTotal
8. Tạo Order records trong DB
9. [If coin] Debit wallet
10. Publish SQS: create_payment, create_order, create_redemption
11. Return orders

### ACT-02: SePay Webhook Processing Activity

**Steps:**

1. SePay gửi POST webhook
2. Verify HMAC-SHA256 signature
3. Check duplicate transaction (by id)
4. Extract payment code từ content (regex)
5. Find Payment by code
6. Verify amount match
7. Update Payment → SUCCESS
8. [If topup] Credit wallet (TOPUP)
9. [If order payment] PaidOrderByPayment
10. Publish SSE event → customer-web

### ACT-03: Merchant Registration Activity

**Steps:**

1. Seller điền form đăng ký (INDIVIDUAL / BUSINESS)
2. Submit → tạo Merchant (status=PENDING)
3. Admin review → APPROVED / REJECTED
4. [If APPROVED] canSell=true, tạo Shop record
5. Seller cập nhật thông tin Shop
6. Shop status: DRAFT → ACTIVE

### ACT-04: Video Upload & Processing Activity

**Steps:**

1. Seller tạo Video record → utility-service (status=PENDING)
2. Nhận presigned URL từ S3
3. Upload MP4 trực tiếp lên S3
4. S3 Event → SQS video-processing
5. Lambda video-submit nhận message
6. Lambda gọi MediaConvert CreateJob
7. MediaConvert transcode HLS ABR
8. MediaConvert → EventBridge (COMPLETE/ERROR)
9. Lambda video-complete → SQS update_video_status
10. utility-service consumer → update Video (status=READY, hlsUrl, thumbnailUrl)

### ACT-05: AI Review Summary Generation Activity

**Steps:**

1. Customer submit review
2. utility-service lưu Review, cập nhật RatingAggregate
3. Fire-and-forget gRPC → ai-service GenerateReviewSummary
4. ai-service fetch tối đa 100 reviews
5. Check: ≥5 reviews? → No: skip
6. Check cache validity: <7 days AND <3 new reviews? → Yes: skip
7. Call Groq API (kimi-k2-instruct) với review texts
8. Parse JSON response: {pros[], cons[], summary}
9. Upsert ReviewSummary trong DB

---

## 5. DATA FLOW DIAGRAMS (`flowchart LR`)

### DFD-01: System-Level DFD (Level 0)

**External entities:** Customer, Seller, Admin, SePay, Cognito, Convex, Groq, Neon DB, Redis, S3, SQS
**Process:** V-Shop System
**Data flows:** HTTP requests, gRPC calls, webhook, SSE events, queue messages

### DFD-02: Order Data Flow (Level 1)

**Processes:** BFF, order-service, catalog-service, promotion-service, wallet-service, payment-service
**Data stores:** order DB, catalog DB, promotion DB, wallet DB, payment DB
**Flows:** cart items → validate → create order → SQS queues → downstream services

### DFD-03: Payment Data Flow (Level 1)

**Processes:** customer-bff, payment-service, wallet-service, order-service
**External:** SePay webhook, VietQR (api-mb)
**Data stores:** payment DB, wallet DB
**Flows:** topup request → QR generation → webhook → verify → credit wallet / pay orders

### DFD-04: Authentication Data Flow (Level 1)

**Processes:** BFF (AuthenticationGuard), iam-service, Cognito
**Data stores:** Redis cache, iam DB (permissions)
**Flows:** cookie tokens → validate → cache → permissions check

### DFD-05: Video Processing Data Flow (Level 1)

**Processes:** seller-bff, utility-service, Lambda submit, MediaConvert, Lambda complete
**Data stores:** utility DB, S3 bucket
**Flows:** upload → S3 event → SQS → Lambda → MediaConvert → EventBridge → Lambda → SQS → DB update

---

## 6. SEQUENCE DIAGRAMS (`sequenceDiagram`)

### SEQ-01: Customer Login (Cognito OIDC)

**Participants:** Browser, customer-web, Cognito, customer-bff, iam-service, Redis
**Steps:** redirect → login → callback → token exchange → ValidateToken → cache → userData

### SEQ-02: Place Order (ONLINE QR Payment)

**Participants:** Customer, customer-web, customer-bff, order-service, catalog-service, promotion-service, wallet-service, payment-service, SQS, api-mb
**Steps:** createOrder → validate → calculate → SQS → createPayment → QR → SSE open

### SEQ-03: SePay Webhook → Payment Confirmation

**Participants:** SePay, customer-bff, payment-service, wallet-service, order-service, SSE stream, customer-web
**Steps:** POST webhook → HMAC verify → Receiver gRPC → find payment → credit/pay → SSE event

### SEQ-04: QR Topup (Nạp V-Xu)

**Participants:** Customer, customer-web, customer-bff, payment-service, api-mb, SePay, wallet-service
**Steps:** POST topup → createPayment → VietQR → scan → webhook → credit wallet → SSE

### SEQ-05: Product Search & View

**Participants:** Customer, customer-web, customer-bff, catalog-service, ai-service
**Steps:** GET products → paginated list → GET product detail → GET review summary

### SEQ-06: Add to Cart & Checkout

**Participants:** Customer, customer-web, customer-bff, order-service, catalog-service, promotion-service, wallet-service
**Steps:** addCartItem → updateCartItem → createOrder (with coin + voucher)

### SEQ-07: Seller Upload Video

**Participants:** Seller, seller-web, seller-bff, utility-service, S3, Lambda, MediaConvert, EventBridge, SQS
**Steps:** createVideo → presignedUrl → PUT S3 → S3 Event → SQS → Lambda → MediaConvert → EventBridge → Lambda → SQS → updateVideoStatus

### SEQ-08: AI Review Summary

**Participants:** Customer, customer-web, customer-bff, utility-service, ai-service, Groq API
**Steps:** createReview → save → fire-and-forget GenerateReviewSummary → fetch reviews → Groq → upsert → GET summary

### SEQ-09: Convex 1-1 Chat

**Participants:** Customer, Seller, customer-web, seller-web, Convex Cloud
**Steps:** getOrCreate conversation → send message → real-time subscription → receive

### SEQ-10: Shop Revenue Settlement

**Participants:** order-service, SQS, wallet-service, seller-web, seller-bff
**Steps:** order COMPLETED → SQS settle_order_revenue → AdjustShopCredit (CREDIT, ORDER_REVENUE) → seller views credit

### SEQ-11: Seller Payout Request

**Participants:** Seller, seller-bff, wallet-service, Admin, admin-bff
**Steps:** createShopPayout (PENDING) → admin reviews → updateShopPayoutStatus (TRANSFERRED/REJECTED)

### SEQ-12: Merchant Registration & Approval

**Participants:** Seller, seller-bff, shop-service, Admin, admin-bff
**Steps:** createMerchant (PENDING) → admin reviews → updateMerchant (APPROVED) → canSell=true → createShop
