# BỘ XÂY DỰNG

# TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI THÀNH PHỐ HỒ CHÍ MINH

---

# BÁO CÁO MÔN HỌC: ĐỒ ÁN THỰC TẾ CÔNG NGHỆ PHẦN MỀM

**Tên đề tài:** XÂY DỰNG HỆ THỐNG WEB SÀN THƯƠNG MẠI ĐIỆN TỬ V-SHOP

|                                  |                        |
| -------------------------------- | ---------------------- |
| **Giảng viên hướng dẫn:**        | **GV. VŨ ĐÌNH LONG**   |
| **Sinh viên thực hiện:** Cao Phi | **MSSV:** 049205000006 |
| **Lớp:**                         | 010412203903           |

_TP. Hồ Chí Minh, ngày 01 tháng 1 năm 2026_

---

## MỤC LỤC

1. [Tổng quan về đề tài](#1-tổng-quan-về-đề-tài)
   - 1.1 Mục tiêu
   - 1.2 Phạm vi thực hiện
   - 1.3 Kế hoạch thực hiện
   - 1.4 Kết quả dự kiến
2. [Cơ sở lý thuyết và phân tích yêu cầu](#2-cơ-sở-lý-thuyết-và-phân-tích-yêu-cầu)
   - 2.1 Công nghệ sử dụng
   - 2.2 Yêu cầu chức năng
   - 2.3 Yêu cầu phi chức năng
3. [Phân tích thiết kế hệ thống](#3-phân-tích-thiết-kế-hệ-thống)
   - 3.1 Kiến trúc hệ thống
   - 3.2 Use Case Diagrams
   - 3.3 ERD – Cơ sở dữ liệu
   - 3.4 Class Diagrams
   - 3.5 Activity Diagrams
   - 3.6 Data Flow Diagrams
   - 3.7 Sequence Diagrams
4. [Hiện thực hệ thống](#4-hiện-thực-hệ-thống)
   - 4.1 Cấu trúc dự án
   - 4.2 BFF Layer
   - 4.3 Microservices
   - 4.4 Infrastructure
5. [Đánh giá và đề xuất](#5-đánh-giá-và-đề-xuất)
6. [Tổng kết](#6-tổng-kết)

---

## NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN

TP. Hồ Chí Minh, Ngày… Tháng… Năm 2026

Giảng viên hướng dẫn

_(Ký và ghi rõ họ tên)_

---

## LỜI CẢM ƠN

Trong quá trình thực hiện đề tài **"Xây dựng hệ thống Web Sàn thương mại điện tử V-Shop"**, em đã nhận được sự hỗ trợ và hướng dẫn từ nhiều phía.

Em xin gửi lời cảm ơn đến **quý thầy cô Khoa Công nghệ Thông tin, Trường Đại học Giao Thông Vận Tải TP.HCM** đã truyền đạt kiến thức nền tảng trong suốt quá trình học tập.

Đặc biệt, em xin cảm ơn **giảng viên hướng dẫn** đã góp ý và định hướng để đề tài hoàn thiện hơn.

Cuối cùng, em cảm ơn **gia đình và bạn bè** đã luôn động viên và hỗ trợ trong suốt thời gian thực hiện.

Do kiến thức và kinh nghiệm còn hạn chế, báo cáo không tránh khỏi thiếu sót. Em rất mong nhận được góp ý từ thầy cô để hoàn thiện hơn.

_TP.HCM, ngày 01 tháng 1 năm 2026_

Sinh viên thực hiện: **Cao Phi**

---

## TÓM TẮT ĐỀ TÀI

Đề tài xây dựng hệ thống sàn thương mại điện tử **V-Shop** — nền tảng mua bán trực tuyến đa người bán (multi-vendor marketplace) triển khai thực tế trên AWS, lấy cảm hứng từ các sàn như Shopee, Tiki nhưng được xây dựng từ đầu với kiến trúc Microservices hiện đại.

**Hệ thống phục vụ 3 nhóm người dùng:**

- **Khách hàng:** tìm kiếm, mua sắm, thanh toán QR/ví/COD, nạp V-Xu, dùng voucher, viết đánh giá, chat với shop và AI chatbot
- **Người bán:** quản lý sản phẩm (SKU, ảnh, video), xử lý đơn hàng, theo dõi doanh thu, rút tiền
- **Admin:** duyệt shop, quản lý người dùng/sản phẩm/khuyến mãi, xử lý vi phạm, duyệt payout

**Kiến trúc:** Hệ thống chia thành 9 microservice độc lập (iam, catalog, shop, order, payment, promotion, utility, wallet, ai), mỗi service có database riêng trên Neon PostgreSQL. Các service giao tiếp qua **gRPC** (đồng bộ) và **AWS SQS** (bất đồng bộ). Lớp **BFF** (customer-bff, seller-bff, admin-bff) đóng vai trò API Gateway cho 3 frontend Next.js.

**Các tính năng kỹ thuật nổi bật:**

- **Thanh toán QR thực tế:** tích hợp VietQR + SePay webhook HMAC-SHA256, xác nhận real-time qua SSE
- **Ví V-Xu:** nạp xu qua QR, dùng xu khi đặt hàng; shop nhận doanh thu vào Credit và rút tiền qua Payout
- **AI Review Summary:** tự động phân tích đánh giá bằng Groq API (Kimi K2), tóm tắt ưu/nhược điểm cho từng sản phẩm
- **AI Chatbot RAG:** chatbot 24/7 trên Convex Cloud, tìm kiếm knowledge base bằng Google Embedding
- **Video HLS pipeline:** upload MP4 → S3 → Lambda → MediaConvert → HLS ABR (1080p/720p/480p)
- **Chat real-time:** Convex WebSocket, hỗ trợ text và ảnh giữa khách hàng và shop

**Hạ tầng:** AWS EKS (Kubernetes), ALB, Route 53, S3, SQS (8 queues), Lambda, Cognito, quản lý bằng Terraform. CI/CD tự động với GitHub Actions → ECR → EKS.

Hệ thống đã được deploy thực tế tại `vshop.hacmieu.com` với đầy đủ 3 giao diện hoạt động và 40 Mermaid diagrams tài liệu hóa toàn bộ thiết kế.

---

## 1. Tổng quan về đề tài

### 1.1 Mục tiêu

Mục tiêu của đề tài là xây dựng một sàn thương mại điện tử hoàn chỉnh, áp dụng kiến trúc Microservices hiện đại và triển khai thực tế trên nền tảng cloud AWS.

**Mục tiêu cụ thể:**

- Xây dựng đầy đủ 3 giao diện: Khách hàng, Người bán, Quản trị viên
- Tích hợp thanh toán QR thực tế qua SePay + VietQR
- Xây dựng hệ thống chat real-time và AI chatbot hỗ trợ khách hàng
- Triển khai CI/CD tự động lên AWS EKS bằng GitHub Actions
- Áp dụng các nguyên lý thiết kế phần mềm: Clean Architecture, Repository Pattern, BFF Pattern

### 1.2 Phạm vi thực hiện

**Nghiệp vụ:**

- Khách hàng: tìm kiếm, mua sắm, thanh toán, đánh giá, chat, nạp xu
- Người bán: quản lý sản phẩm, đơn hàng, doanh thu, rút tiền
- Admin: duyệt shop, quản lý người dùng, sản phẩm, khuyến mãi, báo cáo vi phạm

**Kỹ thuật:**

- Frontend: Next.js 16, React 19, Tailwind CSS
- Backend: NestJS 11, gRPC, Prisma 7, PostgreSQL (Neon)
- Infrastructure: AWS EKS, ALB, S3, SQS, Lambda, Cognito, MediaConvert
- Real-time: Convex Cloud (chat + AI bot), SSE (payment)
- CI/CD: GitHub Actions → ECR Public → kubectl apply

### 1.3 Kế hoạch thực hiện

| Giai đoạn | Thời gian | Nội dung                                      |
| --------- | --------- | --------------------------------------------- |
| 1         | Tuần 1    | Phân tích yêu cầu, thiết kế kiến trúc, ERD    |
| 2         | Tuần 2    | Thiết kế giao diện (Figma), setup monorepo NX |
| 3         | Tuần 3–5  | Lập trình backend (gRPC services), frontend   |
| 4         | Tuần 6–7  | Tích hợp API, CI/CD, deploy AWS EKS           |
| 5         | Tuần 8    | Kiểm thử, hoàn thiện, viết báo cáo            |

### 1.4 Kết quả dự kiến

- Hệ thống hoạt động ổn định, deploy thực tế tại `vshop.hacmieu.com`
- Đầy đủ 3 giao diện web cho 3 nhóm người dùng
- Thanh toán QR hoạt động thực tế với ngân hàng MBBank
- AI chatbot trả lời tự động dựa trên knowledge base
- Tài liệu kỹ thuật đầy đủ: ERD, UML, sequence diagrams

---

## 2. Cơ sở lý thuyết và phân tích yêu cầu

### 2.1 Công nghệ sử dụng

#### Kiến trúc Microservices + BFF Pattern

Hệ thống chia thành nhiều service nhỏ, mỗi service xử lý một nghiệp vụ riêng và có database riêng (Database per Service). Các service giao tiếp với nhau qua **gRPC** (đồng bộ, tốc độ cao) và **AWS SQS** (bất đồng bộ).

**BFF (Backend For Frontend)** là lớp trung gian giữa frontend và microservices. Mỗi loại client có một BFF riêng:

- `customer-bff` phục vụ `customer-web`
- `seller-bff` phục vụ `seller-web`
- `admin-bff` phục vụ `admin-web`

#### Các công nghệ chính

| Layer         | Công nghệ                                  |
| ------------- | ------------------------------------------ |
| Frontend      | Next.js 16, React 19, Tailwind CSS         |
| BFF           | NestJS 11, REST API, Swagger               |
| Microservices | NestJS 11, gRPC, Prisma 7                  |
| Database      | PostgreSQL (Neon Cloud)                    |
| Auth          | AWS Cognito (OIDC, Managed Login)          |
| Message Queue | AWS SQS                                    |
| Storage       | AWS S3                                     |
| Video         | AWS Lambda + MediaConvert (HLS ABR)        |
| Real-time     | Convex Cloud (chat), SSE (payment)         |
| AI            | Groq API (Kimi K2), Google Embedding (RAG) |
| Cache         | Redis Cloud                                |
| Container     | AWS EKS (Kubernetes), Docker               |
| CI/CD         | GitHub Actions, ECR Public                 |
| IaC           | Terraform, Helm/Kustomize                  |

### 2.2 Yêu cầu chức năng

**Khách hàng (Customer):**

- Đăng nhập qua Cognito OIDC
- Tìm kiếm, lọc sản phẩm theo danh mục, thương hiệu, giá
- Xem chi tiết sản phẩm, AI Review Summary
- Quản lý giỏ hàng, đặt hàng (COD / WALLET / ONLINE QR)
- Nạp V-Xu qua QR VietQR, dùng xu khi thanh toán
- Nhận/dùng voucher giảm giá
- Viết đánh giá sản phẩm
- Chat 1-1 với shop, chat với AI chatbot
- Nhận thông báo real-time (SSE)

**Người bán (Seller):**

- Đăng ký Merchant, tạo Shop
- Quản lý sản phẩm (CRUD, SKU, ảnh, video)
- Xử lý đơn hàng (xác nhận → giao hàng → hoàn thành)
- Xem doanh thu Shop Credit, yêu cầu rút tiền
- Trả lời đánh giá, chat với khách hàng

**Quản trị viên (Admin):**

- Duyệt/từ chối Merchant
- Quản lý người dùng (block/unblock)
- Duyệt sản phẩm, quản lý danh mục/thương hiệu
- Tạo/quản lý Promotion, Voucher
- Xử lý Report vi phạm
- Duyệt Payout Request của seller
- Upload Knowledge Base cho AI chatbot

### 2.3 Yêu cầu phi chức năng

- **Hiệu năng:** API phản hồi < 1s nhờ Redis cache, gRPC nội bộ
- **Bảo mật:** HMAC-SHA256 cho webhook SePay, OIDC token ngắn hạn, IRSA cho pod AWS access
- **Khả năng mở rộng:** Microservices scale độc lập trên EKS
- **Độ tin cậy:** SQS DLQ cho video processing, retry logic
- **CI/CD:** Tự động build/push Docker image khi push lên main

---

---

## 3. Phân tích thiết kế hệ thống

### 3.1 Kiến trúc hệ thống

Hệ thống V-Shop được triển khai trên AWS ap-southeast-1 (Singapore) theo mô hình sau:

```
Internet → Route 53 → ACM (SSL) → ALB (Internet-facing)
                                      ↓
                              EKS Cluster (private subnets)
                         ┌────────────┬────────────┐
                    Web Apps       BFF Layer    Microservices
                  (Next.js)      (NestJS)       (NestJS gRPC)
                         └────────────┴────────────┘
                                      ↓
                    Neon PostgreSQL / Redis / SQS / S3
```

{{docs/diagrams/dfd/dfd-01-system.md}}

_Hình 1: Sơ đồ kiến trúc hệ thống tổng quan (Level 0 DFD)_

**Các thành phần chính:**

- **3 Web Apps** (Next.js): customer-web (:3000), seller-web (:3001), admin-web (:3002)
- **3 BFFs** (NestJS REST): customer-bff (:3100), seller-bff (:3200), admin-bff (:3300)
- **9 Microservices** (NestJS gRPC): iam, catalog, shop, order, payment, promotion, utility, wallet, ai
- **AWS Services**: EKS, ALB, S3, SQS (8 queues), Lambda, MediaConvert, Cognito, EventBridge
- **External**: Neon PostgreSQL (9 DB), Redis Cloud, Convex Cloud, Groq API, SePay

### 3.2 Use Case Diagrams

#### 3.2.1 Use Case tổng quan — Khách hàng

{{docs/diagrams/use-case/uc-01-customer.md}}

_Hình 2: Use case diagram — Khách hàng_

Khách hàng có thể thực hiện các nhóm chức năng: xác thực (đăng nhập Cognito), xem/tìm kiếm sản phẩm, quản lý giỏ hàng, đặt hàng và thanh toán, quản lý ví V-Xu, viết đánh giá, chat và nhận thông báo.

#### 3.2.2 Use Case — Người bán

{{docs/diagrams/use-case/uc-02-seller.md}}

_Hình 3: Use case diagram — Người bán_

Người bán đăng ký Merchant → được Admin duyệt → tạo Shop → quản lý sản phẩm, đơn hàng, doanh thu và chat với khách hàng.

#### 3.2.3 Use Case — Quản trị viên

{{docs/diagrams/use-case/uc-03-admin.md}}

_Hình 4: Use case diagram — Quản trị viên_

Admin có quyền quản lý toàn bộ hệ thống: duyệt merchant, quản lý người dùng, sản phẩm, khuyến mãi, xử lý vi phạm và duyệt payout.

---

### 3.3 ERD – Cơ sở dữ liệu

Mỗi microservice có database riêng (Database per Service pattern). Dưới đây là ERD của từng service.

#### 3.3.1 Order Service

{{docs/diagrams/erd/erd-01-order.md}}

_Hình 5: ERD — Order Service (Order, OrderItem, Cart, CartItem)_

Order chứa nhiều OrderItem. Cart của mỗi user chứa nhiều CartItem. Khi checkout, CartItem được chuyển thành OrderItem.

#### 3.3.2 Payment Service

{{docs/diagrams/erd/erd-02-payment.md}}

_Hình 6: ERD — Payment Service (Payment, Transaction, Refund)_

Payment lưu thông tin thanh toán với `code` duy nhất (dạng `TOPUP-YYMMDDXXXXXX`). Transaction lưu dữ liệu webhook từ SePay. Khi Transaction khớp với Payment qua `code`, Payment được cập nhật SUCCESS.

#### 3.3.3 Catalog Service

{{docs/diagrams/erd/erd-03-catalog.md}}

_Hình 7: ERD — Catalog Service (Product, SKU, Category, Brand, Attribute)_

Product thuộc về một Brand, có thể thuộc nhiều Category (M2M), và có nhiều SKU (biến thể: màu sắc, kích thước).

#### 3.3.4 IAM Service

{{docs/diagrams/erd/erd-04-iam.md}}

_Hình 8: ERD — IAM Service (User, Permission)_

User có thể thuộc nhiều group (CUSTOMER, SELLER, ADMIN). Permission định nghĩa quyền truy cập theo path + method + group, dùng cho RBAC.

#### 3.3.5 Shop Service

{{docs/diagrams/erd/erd-05-shop.md}}

_Hình 9: ERD — Shop Service (Merchant, Shop)_

Mỗi Merchant sở hữu đúng một Shop. Merchant cần được Admin duyệt (APPROVED) thì mới có thể bán hàng.

#### 3.3.6 Wallet Service

{{docs/diagrams/erd/erd-06-wallet.md}}

_Hình 10: ERD — Wallet Service (Wallet, WalletTransaction, Credit, CreditTransaction, PayoutRequest)_

Wallet là ví V-Xu của khách hàng. Credit là tài khoản doanh thu của shop. PayoutRequest là yêu cầu rút tiền của seller.

#### 3.3.7 Utility Service

{{docs/diagrams/erd/erd-07-utility.md}}

_Hình 11: ERD — Utility Service (Notification, Review, ReviewReply, RatingAggregate, Report, Video)_

Review được tổng hợp vào RatingAggregate theo productId. Seller có thể reply một Review. Video lưu trạng thái xử lý HLS.

#### 3.3.8 Promotion Service

{{docs/diagrams/erd/erd-08-promotion.md}}

_Hình 12: ERD — Promotion Service (Promotion, Redemption)_

Promotion là chương trình khuyến mãi. Redemption là bản ghi khi user claim voucher và sử dụng khi đặt hàng.

#### 3.3.9 AI Service

{{docs/diagrams/erd/erd-09-ai.md}}

_Hình 13: ERD — AI Service (ReviewSummary)_

ReviewSummary lưu kết quả phân tích AI (pros, cons, summary) cho từng sản phẩm, được cache và cập nhật khi có đủ review mới.

---

### 3.4 Class Diagrams

#### 3.4.1 BFF Authentication Guard Chain

{{docs/diagrams/class/cls-01-auth-guard.md}}

_Hình 14: Class diagram — Auth Guard Chain_

`AuthenticationGuard` là guard chính, điều phối sang `AccessTokenGuard` (xác thực JWT Cognito) hoặc `SepayHmacGuard` (xác thực webhook SePay) dựa trên decorator `@Auth([AuthType.xxx])`.

#### 3.4.2 Payment Domain

{{docs/diagrams/class/cls-02-payment.md}}

_Hình 15: Class diagram — Payment Domain_

`TransactionController` nhận webhook từ SePay, gọi `PaymentService` qua gRPC, sau đó publish SSE event qua `PaymentStreamService` để thông báo real-time cho frontend.

#### 3.4.3 Order Domain

{{docs/diagrams/class/cls-03-order.md}}

_Hình 16: Class diagram — Order Domain_

`OrderController` và `CartController` đều delegate sang `OrderService`, service này gọi gRPC tới order-service để xử lý nghiệp vụ.

#### 3.4.4 Wallet Domain

{{docs/diagrams/class/cls-04-wallet.md}}

_Hình 17: Class diagram — Wallet Domain_

Ba controller (Wallet, Credit, Payout) đều dùng chung `WalletService`. Các enum `WalletTransactionSource`, `CreditTransactionSource`, `PayoutStatus` định nghĩa loại giao dịch.

#### 3.4.5 Catalog Domain

{{docs/diagrams/class/cls-05-catalog.md}}

_Hình 18: Class diagram — Catalog Domain_

`CatalogService` wrap toàn bộ gRPC calls tới catalog-service, bao gồm cả `validateProducts` dùng khi tạo đơn hàng.

#### 3.4.6 Convex Chat Schema

{{docs/diagrams/class/cls-06-convex.md}}

_Hình 19: Class diagram — Convex Chat Schema_

Schema Convex gồm `conversations`, `conversationMembers`, `messages` cho chat 1-1, và `botConversations`, `botKnowledgeBase` cho AI chatbot với RAG.

---

### 3.5 Activity Diagrams

#### 3.5.1 Quy trình tạo đơn hàng

{{docs/diagrams/activity/act-01-order-creation.md}}

_Hình 20: Activity diagram — Tạo đơn hàng_

Khi khách hàng checkout, hệ thống lần lượt: validate cart items, validate stock với catalog-service, kiểm tra promotion, kiểm tra số dư ví nếu dùng coin, tính toán tổng tiền, tạo Order trong DB, debit ví nếu dùng coin, rồi publish các SQS message để tạo payment, gửi notification và tạo redemption.

#### 3.5.2 Quy trình xử lý webhook SePay

{{docs/diagrams/activity/act-02-sepay-webhook.md}}

_Hình 21: Activity diagram — Xử lý webhook SePay_

SePay gửi POST webhook với HMAC-SHA256 signature. Hệ thống verify signature, kiểm tra duplicate transaction, extract payment code từ nội dung chuyển khoản bằng regex, tìm Payment trong DB, verify số tiền, cập nhật trạng thái và credit ví hoặc cập nhật đơn hàng tùy loại thanh toán.

#### 3.5.3 Quy trình đăng ký Merchant

{{docs/diagrams/activity/act-03-merchant-registration.md}}

_Hình 22: Activity diagram — Đăng ký Merchant_

Seller nộp đơn → Admin duyệt → nếu APPROVED thì tạo Shop và thông báo cho Seller → Seller cập nhật thông tin Shop → Shop ACTIVE.

#### 3.5.4 Quy trình xử lý video

{{docs/diagrams/activity/act-04-video-processing.md}}

_Hình 23: Activity diagram — Upload và xử lý video_

Seller upload MP4 trực tiếp lên S3 qua presigned URL → S3 Event trigger SQS → Lambda submit gọi MediaConvert → transcode HLS ABR → EventBridge → Lambda complete → SQS update status → utility-service cập nhật Video record.

#### 3.5.5 Quy trình tạo AI Review Summary

{{docs/diagrams/activity/act-05-ai-review.md}}

_Hình 24: Activity diagram — AI Review Summary_

Sau khi khách hàng viết review, hệ thống fire-and-forget gọi ai-service. AI service fetch tối đa 100 reviews, kiểm tra cache validity, gọi Groq API để phân tích, parse kết quả JSON và upsert ReviewSummary.

---

### 3.6 Data Flow Diagrams

#### 3.6.1 DFD Level 0 — Toàn hệ thống

{{docs/diagrams/dfd/dfd-01-system.md}}

_Hình 25: DFD Level 0 — Toàn hệ thống_

#### 3.6.2 DFD Level 1 — Luồng dữ liệu đặt hàng

{{docs/diagrams/dfd/dfd-02-order.md}}

_Hình 26: DFD Level 1 — Order data flow_

Dữ liệu đặt hàng đi qua BFF → order-service → validate với catalog, promotion, wallet → tạo order → publish SQS → payment-service tạo Payment record.

#### 3.6.3 DFD Level 1 — Luồng dữ liệu thanh toán

{{docs/diagrams/dfd/dfd-03-payment.md}}

_Hình 27: DFD Level 1 — Payment data flow_

Luồng từ tạo QR (api-mb) → khách chuyển khoản → SePay webhook → verify → credit wallet hoặc update order → SSE notify frontend.

#### 3.6.4 DFD Level 1 — Luồng xác thực

{{docs/diagrams/dfd/dfd-04-auth.md}}

_Hình 28: DFD Level 1 — Authentication data flow_

Token từ Cognito → BFF guard → check Redis cache → nếu miss thì gRPC ValidateToken → iam-service verify JWT → load permissions → cache result.

#### 3.6.5 DFD Level 1 — Luồng xử lý video

{{docs/diagrams/dfd/dfd-05-video.md}}

_Hình 29: DFD Level 1 — Video processing data flow_

Upload → S3 → SQS → Lambda → MediaConvert → S3 output → EventBridge → Lambda → SQS status → utility-service update DB.

---

### 3.7 Sequence Diagrams

#### 3.7.1 Đăng nhập (Cognito OIDC)

{{docs/diagrams/sequence/seq-01-login.md}}

_Hình 30: Sequence diagram — Đăng nhập_

Người dùng được redirect sang Cognito Managed Login, sau khi xác thực thành công nhận token và lưu vào httpOnly cookie. Mỗi request tiếp theo, BFF kiểm tra Redis cache trước khi gọi gRPC ValidateToken.

#### 3.7.2 Đặt hàng thanh toán QR

{{docs/diagrams/sequence/seq-02-place-order.md}}

_Hình 31: Sequence diagram — Đặt hàng ONLINE QR_

Luồng đầy đủ từ checkout → validate → tạo order → SQS → tạo payment → VietQR → SSE stream mở chờ xác nhận.

#### 3.7.3 Webhook SePay xác nhận thanh toán

{{docs/diagrams/sequence/seq-03-sepay-webhook.md}}

_Hình 32: Sequence diagram — SePay webhook_

SePay POST webhook → verify HMAC → gRPC Receiver → tìm payment → credit wallet/update order → SSE notify customer.

#### 3.7.4 Nạp V-Xu (QR Topup)

{{docs/diagrams/sequence/seq-04-topup.md}}

_Hình 33: Sequence diagram — Nạp V-Xu_

Khách chọn mệnh giá → tạo Payment → VietQR → quét QR chuyển khoản → SePay webhook → credit wallet → SSE thông báo thành công.

#### 3.7.5 Tìm kiếm và xem sản phẩm

{{docs/diagrams/sequence/seq-05-product-search.md}}

_Hình 34: Sequence diagram — Tìm kiếm sản phẩm_

GET products (public, no auth) → gRPC GetManyProducts → paginated response. Xem chi tiết → gRPC GetProduct + GetReviewSummary song song.

#### 3.7.6 Thêm giỏ hàng và checkout

{{docs/diagrams/sequence/seq-06-cart-checkout.md}}

_Hình 35: Sequence diagram — Giỏ hàng và checkout_

AddCartItem → UpdateCartItem → CheckPromotion → CreateOrder với coin + voucher → AdjustWallet debit.

#### 3.7.7 Seller upload video

{{docs/diagrams/sequence/seq-07-video-upload.md}}

_Hình 36: Sequence diagram — Upload video_

CreateVideo → presigned URL → PUT S3 trực tiếp → async pipeline → MediaConvert → HLS output → update Video READY.

#### 3.7.8 AI Review Summary

{{docs/diagrams/sequence/seq-08-ai-review.md}}

_Hình 37: Sequence diagram — AI Review Summary_

CreateReview → fire-and-forget GenerateReviewSummary → fetch reviews → Groq API → upsert summary. Customer xem summary qua GET endpoint public.

#### 3.7.9 Chat 1-1 (Convex)

{{docs/diagrams/sequence/seq-09-chat.md}}

_Hình 38: Sequence diagram — Chat 1-1_

getOrCreate conversation → send message → Convex real-time push → đối phương nhận ngay qua WebSocket subscription.

#### 3.7.10 Thanh toán doanh thu shop

{{docs/diagrams/sequence/seq-10-revenue-settlement.md}}

_Hình 39: Sequence diagram — Revenue settlement_

Order COMPLETED → SQS settle_order_revenue → AdjustShopCredit (CREDIT, ORDER_REVENUE) → seller xem doanh thu.

#### 3.7.11 Seller yêu cầu rút tiền

{{docs/diagrams/sequence/seq-11-payout.md}}

_Hình 40: Sequence diagram — Payout request_

Seller tạo PayoutRequest (PENDING) → Admin duyệt → TRANSFERRED (debit credit) hoặc REJECTED.

#### 3.7.12 Đăng ký và duyệt Merchant

{{docs/diagrams/sequence/seq-12-merchant.md}}

_Hình 41: Sequence diagram — Merchant registration_

Seller nộp đơn → Admin duyệt APPROVED → tạo Shop → Seller cập nhật → Shop ACTIVE.

---

## 4. Hiện thực hệ thống

### 4.1 Cấu trúc dự án

Dự án được tổ chức theo mô hình **NX Monorepo** với pnpm workspace:

```
fcj-hacmieu/
├── apps/
│   ├── bffs/
│   │   ├── customer-bff/     # REST API cho customer-web
│   │   ├── seller-bff/       # REST API cho seller-web
│   │   └── admin-bff/        # REST API cho admin-web
│   ├── services/
│   │   ├── iam-service/      # Auth, User, Permission (gRPC :5001)
│   │   ├── catalog-service/  # Product, Category, Brand (gRPC :5002)
│   │   ├── shop-service/     # Merchant, Shop (gRPC :5003)
│   │   ├── order-service/    # Order, Cart (gRPC :5004)
│   │   ├── payment-service/  # Payment, Transaction, Refund (gRPC :5005)
│   │   ├── promotion-service/# Promotion, Redemption (gRPC :5006)
│   │   ├── utility-service/  # Notification, Review, Video, Report (gRPC :5007)
│   │   ├── wallet-service/   # Wallet, Credit, Payout (gRPC :5008)
│   │   └── ai-service/       # ReviewSummary (gRPC :5009)
│   └── webs/
│       ├── customer-web/     # Next.js :3000
│       ├── seller-web/       # Next.js :3001
│       └── admin-web/        # Next.js :3002
├── libs/
│   ├── interfaces/           # Proto types, DTOs, Zod models
│   ├── guards/               # AccessTokenGuard, SepayHmacGuard
│   ├── configurations/       # Env config (Zod validation)
│   ├── constants/            # Enums (OrderStatus, PaymentMethod...)
│   ├── decorators/           # @Auth, @UserData, @ProcessId
│   ├── convex/               # Convex schema + functions
│   └── web-core/             # Shared Next.js utilities
├── proto/                    # gRPC .proto files
├── helm/manifests/           # Kubernetes manifests (Kustomize)
└── terraform/                # Infrastructure as Code
```

Mỗi service backend tuân theo cấu trúc phân lớp:

```
Controller → Service → Repository → Prisma → PostgreSQL
```

### 4.2 BFF Layer

BFF đóng vai trò API Gateway thông minh: nhận REST request từ frontend, gọi gRPC tới các microservice, tổng hợp dữ liệu và trả về đúng format frontend cần.

**customer-bff** (port 3100) — phục vụ customer-web:

- Xác thực: `AuthenticationGuard` → `AccessTokenGuard` (JWT Cognito) hoặc `SepayHmacGuard` (webhook)
- Các module: IAM, Catalog, Order, Payment, Wallet, Promotion, Utility, AI
- Đặc biệt: SSE endpoint cho payment confirmation và notification real-time

**seller-bff** (port 3200) — phục vụ seller-web:

- Thêm quyền SELLER: quản lý sản phẩm, video, shop credit, payout
- Chỉ truy cập được data của shop mình (shopId từ token)

**admin-bff** (port 3300) — phục vụ admin-web:

- Quyền ADMIN: truy cập toàn bộ data của mọi service
- Thêm: duyệt merchant, xử lý report, duyệt payout, quản lý permissions

### 4.3 Microservices

Mỗi service được build thành Docker image, push lên ECR Public và deploy trên EKS.

**Giao tiếp nội bộ:**

- **gRPC** (đồng bộ): BFF → Service, Service → Service (ví dụ order-service gọi catalog-service để validate products)
- **SQS** (bất đồng bộ): các event như `create_payment`, `create_order`, `settle_order_revenue`, `update_video_status`

**Xác thực:**

- Mỗi request từ BFF đến service đều mang `processId` (tracing) và `userId` (từ token đã validate)
- Service không tự validate token, tin tưởng BFF đã xác thực

**Database:**

- Mỗi service có Prisma schema riêng, kết nối tới database riêng trên Neon PostgreSQL
- Không có foreign key cross-service, chỉ lưu ID tham chiếu

### 4.4 Infrastructure

**AWS EKS:**

- Cluster `fcj-hacmieu` tại ap-southeast-1 (Singapore)
- Node group: t3.medium × 2 (min 1, max 3)
- Private subnets: 10.0.10.0/24, 10.0.20.0/24 (2 AZ)
- Public subnets: 10.0.1.0/24, 10.0.2.0/24 (ALB, NAT Gateway)

**ALB Ingress:**

- Internet-facing ALB với SSL/TLS (ACM certificate)
- Route 53 wildcard: `*.hacmieu.com`
- Routing: `vshop.hacmieu.com/api/v1` → customer-bff, `seller.vshop.hacmieu.com/api/v1` → seller-bff

**CI/CD Pipeline:**

```
Push to main
    ↓
GitHub Actions (OIDC → AWS)
    ↓
Detect affected apps (path-based)
    ↓
Docker build + push → ECR Public
    ↓
kubectl apply (Kustomize)
    ↓
EKS rolling update
```

**Terraform modules:**

- `vpc`: VPC, public/private subnets, NAT Gateway
- `eks`: EKS cluster, managed node group, IRSA
- `bastion`: EC2 bastion host để kubectl access
- `iam`: ALB controller IRSA, app IRSA (SQS + S3 access)
- `video-processing`: SQS, Lambda, MediaConvert, EventBridge

---

## 5. Đánh giá và đề xuất

### 5.1 Kết quả đạt được

**Chức năng hoàn thiện:**

| Nhóm     | Chức năng                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| Customer | Đăng nhập Cognito, tìm kiếm sản phẩm, giỏ hàng, đặt hàng (COD/WALLET/QR), nạp V-Xu, voucher, đánh giá, chat, thông báo SSE |
| Seller   | Đăng ký merchant, quản lý shop/sản phẩm/SKU, xử lý đơn hàng, upload video, xem doanh thu, rút tiền                         |
| Admin    | Duyệt merchant, quản lý user/sản phẩm/promotion, xử lý report, duyệt payout, upload AI knowledge base                      |
| AI       | Review summary tự động (Groq + Google Embedding), AI chatbot RAG (Convex + Groq)                                           |
| Video    | Upload → S3 → Lambda → MediaConvert → HLS ABR (1080p/720p/480p)                                                            |
| Payment  | QR VietQR thực tế, webhook SePay HMAC-SHA256, SSE real-time confirmation                                                   |

**Kỹ thuật:**

- Deploy thực tế tại `vshop.hacmieu.com`
- CI/CD tự động với GitHub Actions + ECR + EKS
- Infrastructure as Code với Terraform
- 40 Mermaid diagrams tài liệu hóa đầy đủ

### 5.2 Liên kết triển khai

- **Customer Web:** https://vshop.hacmieu.com
- **Seller Web:** https://seller.vshop.hacmieu.com
- **Admin Web:** https://admin.vshop.hacmieu.com
- **GitHub:** https://github.com/IST-4P/fcj-hacmieu

### 5.3 Hạn chế

- Chưa có unit test và integration test đầy đủ
- Giao diện một số màn hình phụ chưa được tối ưu UX
- Chưa có monitoring/alerting (CloudWatch alarms, Grafana)
- Chưa tích hợp đơn vị vận chuyển thực tế (GHN, GHTK) để tính phí ship tự động
- Chưa có tính năng gợi ý sản phẩm dựa trên hành vi người dùng

### 5.4 Hướng phát triển

- Tích hợp API vận chuyển (GHN/GHTK) để tracking đơn hàng real-time
- Xây dựng Recommendation System dựa trên lịch sử mua hàng
- Thêm mobile app (React Native) với push notification
- Triển khai Horizontal Pod Autoscaler trên EKS
- Tích hợp OpenTelemetry để distributed tracing giữa các service

---

## 6. Tổng kết

### 6.1 Kết quả đạt được

Đề tài đã xây dựng thành công hệ thống sàn thương mại điện tử V-Shop với đầy đủ 3 giao diện (customer, seller, admin), 9 microservices backend, và triển khai thực tế trên AWS EKS.

Điểm nổi bật của dự án:

- **Thanh toán thực tế**: Tích hợp VietQR + SePay webhook với xác thực HMAC-SHA256
- **AI tích hợp**: Review summary tự động và AI chatbot RAG với Groq + Google Embedding
- **Video processing**: Pipeline serverless hoàn chỉnh với Lambda + MediaConvert + HLS ABR
- **Real-time**: Chat 1-1 qua Convex, payment confirmation qua SSE
- **Infrastructure**: Terraform + EKS + CI/CD tự động

### 6.2 Bài học rút ra

- Microservices tăng độ phức tạp đáng kể so với monolith, cần lập kế hoạch kỹ từ đầu
- gRPC nhanh hơn REST cho internal communication nhưng cần quản lý proto files cẩn thận
- SQS giúp decouple services hiệu quả, tránh cascade failure
- Terraform giúp infrastructure reproducible và dễ quản lý
- NX Monorepo giúp share code giữa các apps/services nhưng cần cấu hình build cẩn thận

### 6.3 Kết luận

Dù là đồ án sinh viên với thời gian 2 tháng và 1 thành viên, V-Shop đã đạt được mức độ hoàn thiện khá cao về mặt kỹ thuật. Hệ thống không chỉ hoạt động trên môi trường local mà còn được deploy thực tế trên AWS với đầy đủ CI/CD, infrastructure as code và tài liệu kỹ thuật.

Đây là nền tảng tốt để tiếp tục phát triển thêm các tính năng nâng cao trong tương lai.

---

### Bảng phân công công việc

| Họ tên – MSSV              | Công việc                                                                                                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cao Phi – 049205000006** | Toàn bộ: Phân tích yêu cầu, thiết kế kiến trúc, backend (9 microservices + 3 BFFs), frontend (3 web apps), infrastructure (Terraform + EKS + CI/CD), tích hợp SePay/Cognito/Convex/Groq, viết tài liệu và báo cáo |
