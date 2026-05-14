# Thiết kế: AI Review Summary (Trích xuất Ưu/Nhược điểm từ bình luận)

## Tổng quan

Khi sản phẩm có đủ bình luận (≥ 5), hệ thống tự động dùng AI (Groq + Vercel AI SDK) phân tích toàn bộ reviews và tạo bản tóm tắt ưu/nhược điểm. Kết quả được **cache vào database** để không tốn phí mỗi lần user xem.

## Kiến trúc

```
┌─────────────┐     gRPC      ┌──────────────┐     Groq API     ┌─────────┐
│ catalog-bff │ ──────────────→│  ai-service  │ ────────────────→│  Groq   │
│ (customer)  │                │  (NestJS)    │                  │  Cloud  │
└─────────────┘                └──────────────┘                  └─────────┘
       ↑                              │
       │                              │ Prisma (PostgreSQL)
       │                              ↓
       │                       ┌──────────────┐
       │                       │ ReviewSummary│ (cached result)
       │                       │    table     │
       │                       └──────────────┘
       │
       │  GET /catalog/product/:id
       ↓
┌─────────────┐
│ customer-web│ (hiển thị summary)
└─────────────┘
```

## Flow chi tiết

### 1. Trigger tạo summary

- **Khi nào**: Sau khi user tạo review mới (utility-service) → emit event/gọi gRPC tới ai-service
- **Điều kiện**: Sản phẩm có ≥ 5 reviews VÀ (chưa có summary HOẶC summary cũ hơn 7 ngày HOẶC có ≥ 3 reviews mới kể từ lần tạo summary cuối)
- **Async**: Không block user — chạy background

### 2. AI Service xử lý

1. Lấy tất cả reviews của product (gọi utility-service qua gRPC)
2. Gom nội dung reviews thành 1 prompt
3. Gọi Groq API với system prompt yêu cầu phân tích sentiment
4. Parse response → lưu vào `ReviewSummary` table

### 3. Hiển thị

- Customer-web gọi BFF → BFF gọi ai-service `getReviewSummary(productId)` → trả cached result
- Nếu chưa có summary → không hiển thị (hoặc hiện "Đang phân tích...")
- UI: card "Tóm tắt đánh giá" với danh sách ưu điểm (✓) và nhược điểm (✗)

## AI Service (NestJS Application)

### Tạo mới: `apps/services/ai-service`

```
apps/services/ai-service/
├── prisma/
│   └── schema.prisma          # ReviewSummary model
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   └── review-summary/
│   │   │       ├── controllers/
│   │   │       │   └── review-summary-grpc.controller.ts
│   │   │       ├── services/
│   │   │       │   └── review-summary.service.ts
│   │   │       ├── repositories/
│   │   │       │   └── review-summary.repository.ts
│   │   │       └── review-summary.module.ts
│   │   └── app.module.ts
│   ├── prisma/
│   │   └── prisma.service.ts
│   └── main.ts
├── project.json
├── tsconfig.app.json
└── webpack.config.js
```

### Prisma Schema

```prisma
model ReviewSummary {
  id          String   @id @default(uuid())
  productId   String   @unique
  pros        String[] // Danh sách ưu điểm
  cons        String[] // Danh sách nhược điểm
  summary     String   // Tóm tắt tổng quan (1-2 câu)
  reviewCount Int      // Số reviews đã phân tích
  lastReviewAt DateTime // Thời điểm review mới nhất khi tạo summary
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([productId])
}
```

### Dependencies

```json
{
  "@ai-sdk/groq": "^2.0.34",
  "ai": "^5.0.129"
}
```

### Groq Integration

```typescript
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

const model = groq('moonshotai/kimi-k2-instruct-0905');

const REVIEW_ANALYSIS_PROMPT = `
Bạn là AI phân tích đánh giá sản phẩm. Nhiệm vụ:
1. Đọc tất cả bình luận bên dưới
2. Trích xuất các ưu điểm (pros) và nhược điểm (cons) được nhắc đến nhiều nhất
3. Viết 1 câu tóm tắt tổng quan

Trả về JSON format:
{
  "pros": ["ưu điểm 1", "ưu điểm 2", ...],
  "cons": ["nhược điểm 1", "nhược điểm 2", ...],
  "summary": "Tóm tắt 1-2 câu"
}

Quy tắc:
- Tối đa 5 pros, 5 cons
- Mỗi item ngắn gọn (< 20 từ)
- Viết bằng tiếng Việt
- Chỉ trả JSON, không thêm text khác
- Nếu không đủ dữ liệu, trả pros/cons rỗng
`;

async function analyzeReviews(reviews: { content: string; rating: number }[]) {
  const reviewsText = reviews.map((r, i) => `[${r.rating}⭐] ${r.content}`).join('\n');

  const { text } = await generateText({
    model,
    messages: [
      { role: 'system', content: REVIEW_ANALYSIS_PROMPT },
      { role: 'user', content: reviewsText },
    ],
  });

  return JSON.parse(text);
}
```

### gRPC Interface

```protobuf
service ReviewSummaryModule {
  rpc GetReviewSummary (GetReviewSummaryRequest) returns (ReviewSummaryResponse);
  rpc GenerateReviewSummary (GenerateReviewSummaryRequest) returns (ReviewSummaryResponse);
}

message GetReviewSummaryRequest {
  string processId = 1;
  string productId = 2;
}

message GenerateReviewSummaryRequest {
  string processId = 1;
  string productId = 2;
}

message ReviewSummaryResponse {
  string id = 1;
  string productId = 2;
  repeated string pros = 3;
  repeated string cons = 4;
  string summary = 5;
  int32 reviewCount = 6;
  string createdAt = 7;
  string updatedAt = 8;
}
```

### Cache Strategy

- **Lưu vào DB** (PostgreSQL) — persistent, survive restart
- **Invalidation**: khi có review mới → check điều kiện → regenerate nếu cần
- **TTL**: summary hợp lệ 7 ngày HOẶC cho đến khi có ≥ 3 reviews mới
- **Không dùng Redis** cho cache này — data ít thay đổi, DB query đủ nhanh (indexed by productId)

### Environment Variables

```env
GROQ_API_KEY=gsk_...
AI_SERVICE_PORT=3009
AI_SERVICE_GRPC_URL=0.0.0.0:5009
AI_SERVICE_DATABASE_URL=postgresql://...
```

## Frontend (customer-web)

### UI Component: `ReviewSummaryCard`

```tsx
<div className="card p-5 mb-4">
  <h3 className="font-semibold mb-3">Tóm tắt đánh giá từ AI</h3>
  <p className="text-sm text-ink-muted mb-3">{summary.summary}</p>
  <div className="grid sm:grid-cols-2 gap-4">
    <div>
      <h4 className="text-sm font-medium text-success mb-2">Ưu điểm</h4>
      <ul className="space-y-1">
        {summary.pros.map((pro) => (
          <li className="text-sm flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
            {pro}
          </li>
        ))}
      </ul>
    </div>
    <div>
      <h4 className="text-sm font-medium text-danger mb-2">Nhược điểm</h4>
      <ul className="space-y-1">
        {summary.cons.map((con) => (
          <li className="text-sm flex items-start gap-2">
            <XCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
            {con}
          </li>
        ))}
      </ul>
    </div>
  </div>
</div>
```

### Vị trí hiển thị

- Trang chi tiết sản phẩm (`/product/[id]`) — ngay trên section "Đánh giá sản phẩm"
- Chỉ hiển thị khi có summary (không hiện nếu chưa có)

## Ước tính chi phí

- Groq free tier: 30 requests/minute, 14,400 requests/day
- Mỗi product chỉ gọi AI 1 lần (cache) → rất tiết kiệm
- Regenerate tối đa 1 lần/7 ngày/product
- Với 1000 sản phẩm: ~1000 requests ban đầu, sau đó ~150 requests/ngày (products có review mới)
