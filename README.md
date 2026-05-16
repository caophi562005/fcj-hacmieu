# V-Shop — Sàn Thương Mại Điện Tử Microservices

## Tên đề tài

**Xây dựng sàn thương mại điện tử theo kiến trúc Microservices trên nền tảng Cloud AWS**

---

## Tổng quan hệ thống

Hệ thống sàn TMĐT V-Shop được xây dựng theo kiến trúc **Microservices**, triển khai trên **AWS EKS (Kubernetes)**, sử dụng **gRPC** cho giao tiếp giữa các service, **SQS** cho message queue, và **Convex** cho real-time chat + AI chatbot.

---

## Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├──────────────┬──────────────────┬───────────────────────────────┤
│ customer-web │   seller-web     │         admin-web             │
│ (Khách hàng) │ (Nhà bán hàng)  │       (Quản trị viên)         │
└──────┬───────┴────────┬─────────┴──────────────┬────────────────┘
       │                │                        │
       ▼                ▼                        ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────────────────┐
│ customer-bff │ │  seller-bff  │ │          admin-bff           │
│   (NestJS)   │ │   (NestJS)   │ │          (NestJS)            │
└──────┬───────┘ └──────┬───────┘ └──────────────┬───────────────┘
       │                │                        │
       └────────────────┼────────────────────────┘
                        │ gRPC
       ┌────────────────┼────────────────────────────────┐
       ▼                ▼                ▼               ▼
┌────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────┐
│iam-service │ │catalog-service│ │order-service│ │payment-service│
├────────────┤ ├──────────────┤ ├────────────┤ ├──────────────┤
│shop-service│ │utility-service│ │wallet-service│ │  ai-service  │
└────────────┘ └──────────────┘ └────────────┘ └──────────────┘
       │                │                │               │
       ▼                ▼                ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL (Neon - mỗi service 1 DB)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Services (NestJS + gRPC + Prisma)

| Service               | Chức năng                                                | Database   |
| --------------------- | -------------------------------------------------------- | ---------- |
| **iam-service**       | Xác thực (Cognito), quản lý user, phân quyền RBAC        | PostgreSQL |
| **catalog-service**   | Quản lý sản phẩm, danh mục, thương hiệu, thuộc tính, SKU | PostgreSQL |
| **order-service**     | Quản lý đơn hàng, giỏ hàng, timeline đơn hàng            | PostgreSQL |
| **payment-service**   | Thanh toán QR (VietQR), webhook ngân hàng, hoàn tiền     | PostgreSQL |
| **shop-service**      | Quản lý shop, merchant, duyệt đăng ký bán hàng           | PostgreSQL |
| **wallet-service**    | Ví xu (V-Xu), nạp xu, lịch sử giao dịch, rút tiền        | PostgreSQL |
| **utility-service**   | Thông báo, đánh giá sản phẩm, upload media, địa chỉ      | PostgreSQL |
| **promotion-service** | Voucher, mã giảm giá, chương trình khuyến mãi            | PostgreSQL |
| **ai-service**        | Phân tích đánh giá bằng AI (Groq), tóm tắt ưu/nhược điểm | PostgreSQL |

---

## BFF Layer (Backend For Frontend)

| BFF              | Phục vụ      | Vai trò                                                   |
| ---------------- | ------------ | --------------------------------------------------------- |
| **customer-bff** | customer-web | Proxy gRPC → REST, xác thực customer, SSE payment         |
| **seller-bff**   | seller-web   | Proxy gRPC → REST, xác thực seller                        |
| **admin-bff**    | admin-web    | Proxy gRPC → REST, xác thực admin, quản trị toàn hệ thống |

---

## Frontend Applications (Next.js 16 + Tailwind CSS)

| App              | Đối tượng     | Tính năng chính                                                |
| ---------------- | ------------- | -------------------------------------------------------------- |
| **customer-web** | Khách hàng    | Mua sắm, giỏ hàng, thanh toán QR, nạp xu, chat 1-1, AI chatbot |
| **seller-web**   | Nhà bán hàng  | Quản lý sản phẩm, đơn hàng, tài chính, chat với khách          |
| **admin-web**    | Quản trị viên | Quản lý user, shop, voucher, duyệt merchant, knowledge base AI |

---

## Shared Libraries (Nx Monorepo)

| Library               | Mô tả                                                             |
| --------------------- | ----------------------------------------------------------------- |
| `libs/web-core`       | API factory, OIDC, IAM, auth helpers — dùng chung 3 web           |
| `libs/web-ui`         | Shared React components (Pagination, UserMenu, Sidebar, Toast...) |
| `libs/web-theme`      | Tailwind presets + CSS chung                                      |
| `libs/convex`         | Real-time chat 1-1 + AI chatbot (Convex)                          |
| `libs/interfaces`     | Proto types, DTOs, Zod models — dùng chung toàn hệ thống          |
| `libs/constants`      | Enums, constants (OrderStatus, PaymentMethod...)                  |
| `libs/configurations` | Đọc env vars (app, grpc, redis, auth, pagination...)              |
| `libs/schemas`        | Zod schemas cho validation                                        |

---

## Tính năng nổi bật

### 1. Thanh toán QR (VietQR)

- Tạo mã QR chuyển khoản ngân hàng
- Webhook tự động xác nhận thanh toán
- SSE real-time cập nhật trạng thái trên giao diện

### 2. AI Chatbot (Convex + Groq)

- Chatbot hỗ trợ khách hàng 24/7
- RAG (Retrieval-Augmented Generation) — trả lời dựa trên knowledge base
- Admin upload tài liệu → bot tự động học
- Lịch sử chat tự xoá sau 24h (cron job)

### 3. AI Review Summary

- Phân tích hàng nghìn đánh giá bằng AI
- Tóm tắt ưu/nhược điểm hiển thị trên trang sản phẩm
- Cache kết quả vào DB — không gọi AI mỗi lần xem

### 4. Nạp xu (V-Xu)

- Chọn mệnh giá hoặc nhập số tùy ý
- Thanh toán qua QR → webhook → tự động cộng xu
- Dùng xu giảm giá khi mua hàng

### 5. Video Processing (Serverless)

- Upload video → S3 trigger → SQS → Lambda (ffmpeg)
- Transcode HLS ABR (1080p/720p/480p)
- Tự động tạo thumbnail

### 6. Real-time Chat 1-1 (Convex)

- Chat giữa khách hàng và shop
- Tin nhắn text + hình ảnh
- Real-time subscription (không cần polling)

---

## Công nghệ sử dụng

| Layer          | Công nghệ                                                 |
| -------------- | --------------------------------------------------------- |
| Frontend       | Next.js 16, React 19, Tailwind CSS 3, TypeScript          |
| BFF            | NestJS 11, gRPC client, Swagger                           |
| Backend        | NestJS 11, gRPC server, Prisma 7, PostgreSQL              |
| Auth           | AWS Cognito (Managed Login, OIDC)                         |
| Message Queue  | AWS SQS                                                   |
| Real-time      | Convex (chat, chatbot), SSE (payment)                     |
| AI             | Groq (Kimi K2 / Llama 4), Google Embedding, Vercel AI SDK |
| Storage        | AWS S3                                                    |
| Video          | AWS Lambda + ffmpeg (HLS ABR)                             |
| Infrastructure | AWS EKS, Terraform, Helm, Docker                          |
| CI/CD          | GitHub Actions, ECR                                       |
| Monorepo       | Nx 22, pnpm                                               |

---

## Triển khai (Infrastructure)

```
AWS Cloud (ap-southeast-1)
├── VPC (public + private subnets)
├── EKS Cluster (Kubernetes)
│   ├── Services (NestJS containers)
│   ├── BFFs (NestJS containers)
│   └── Web apps (Next.js containers)
├── S3 (media storage + video)
├── SQS (message queues)
├── Lambda (video processing)
├── Cognito (authentication)
├── Neon PostgreSQL (managed DB)
├── Redis (caching, rate limiting)
└── Convex Cloud (real-time + AI)
```

---

## Cấu trúc thư mục

```
fcj-hacmieu/
├── apps/
│   ├── bffs/           # customer-bff, seller-bff, admin-bff
│   ├── services/       # 9 microservices (NestJS)
│   └── webs/           # customer-web, seller-web, admin-web (Next.js)
├── libs/               # Shared libraries (12 libs)
├── terraform/          # Infrastructure as Code
├── helm/               # Kubernetes manifests
├── proto/              # gRPC proto files
└── .github/            # CI/CD workflows
```
