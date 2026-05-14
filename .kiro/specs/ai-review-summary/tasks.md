# Kế hoạch thực hiện: AI Review Summary

## Phase 1: Tạo ai-service (NestJS application)

- [ ] 1.1 Tạo NestJS application bằng Nx generator
  - `pnpm nx g @nx/nest:application ai-service --directory=apps/services/ai-service`
  - Cấu hình port 3009, gRPC port 5009

- [ ] 1.2 Cài đặt dependencies
  - `@ai-sdk/groq` — Groq provider
  - `ai` — Vercel AI SDK (generateText)
  - `@prisma/client`, `prisma` — database
  - Các deps chung: `@nestjs/microservices`, `@grpc/grpc-js`, `@grpc/proto-loader`

- [ ] 1.3 Tạo Prisma schema cho ai-service
  - Database: `AI_SERVICE_DATABASE_URL` (PostgreSQL mới trên Neon)
  - Model `ReviewSummary`: id, productId (unique), pros (String[]), cons (String[]), summary, reviewCount, lastReviewAt, createdAt, updatedAt
  - Chạy `pnpm nx generate-prisma ai-service`

- [ ] 1.4 Tạo proto file `proto/ai.proto`
  - Service `ReviewSummaryModule`
  - RPC: `GetReviewSummary`, `GenerateReviewSummary`
  - Messages: `GetReviewSummaryRequest`, `GenerateReviewSummaryRequest`, `ReviewSummaryResponse`
  - Chạy `pnpm nx generate-ts-proto interfaces` để generate TypeScript types

- [ ] 1.5 Implement review-summary module
  - `review-summary.repository.ts` — CRUD cho ReviewSummary table
  - `review-summary.service.ts` — logic chính: lấy reviews, gọi AI, lưu kết quả
  - `review-summary-grpc.controller.ts` — expose gRPC endpoints
  - `review-summary.module.ts` — wire dependencies

- [ ] 1.6 Implement AI logic
  - Import `groq` từ `@ai-sdk/groq`, `generateText` từ `ai`
  - Model: `groq('moonshotai/kimi-k2-instruct-0905')` (giống echo project)
  - System prompt: phân tích reviews → trả JSON { pros, cons, summary }
  - Parse JSON response, validate, lưu vào DB
  - Error handling: nếu AI trả format sai → retry 1 lần hoặc skip

- [ ] 1.7 Kết nối utility-service để lấy reviews
  - ai-service gọi utility-service qua gRPC: `getManyReviews({ productId, page: 1, limit: 100 })`
  - Hoặc: tạo endpoint mới ở utility-service `getAllReviewsByProduct(productId)` trả tất cả reviews (không phân trang)

- [ ] 1.8 Cấu hình environment
  - Thêm vào `.env`: `GROQ_API_KEY`, `AI_SERVICE_PORT=3009`, `AI_SERVICE_GRPC_URL=0.0.0.0:5009`, `AI_SERVICE_DATABASE_URL`
  - Thêm vào `libs/configurations`: `AiConfiguration` schema

- [ ] 1.9 Build verification
  - `pnpm nx build ai-service`

## Phase 2: Tích hợp BFF + Frontend

- [ ] 2.1 Thêm gRPC client cho ai-service vào customer-bff
  - Đăng ký `GrpcClientProvider(GrpcService.AI_SERVICE)` trong catalog module hoặc tạo module riêng
  - Tạo service wrapper: `getReviewSummary(productId)`

- [ ] 2.2 Thêm endpoint BFF
  - `GET /catalog/product/:id/review-summary` → gọi ai-service `GetReviewSummary`
  - Trả về `ReviewSummaryResponse` hoặc `null` nếu chưa có

- [ ] 2.3 Tạo lib function ở customer-web
  - `src/lib/review-summary.ts`: `getReviewSummary(productId): Promise<ReviewSummary | null>`
  - Gọi BFF endpoint, handle 404 → return null

- [ ] 2.4 Tạo UI component `ReviewSummaryCard`
  - `src/components/ReviewSummaryCard.tsx`
  - Props: `{ summary: ReviewSummary }`
  - Hiển thị: tóm tắt, danh sách pros (✓ xanh), cons (✗ đỏ)
  - Responsive: 2 cột trên desktop, 1 cột trên mobile

- [ ] 2.5 Tích hợp vào trang product detail
  - `src/app/product/[id]/page.tsx`
  - Gọi `getReviewSummary(product.id)` song song với reviews
  - Render `<ReviewSummaryCard>` ngay trên section "Đánh giá sản phẩm" (chỉ khi có data)

- [ ] 2.6 Build verification
  - `pnpm nx build customer-bff`
  - `pnpm nx build customer-web`

## Phase 3: Trigger tự động khi có review mới

- [ ] 3.1 Sau khi tạo review (utility-service) → gọi ai-service
  - Trong utility-service `createReview` handler, sau khi lưu review thành công:
  - Gọi gRPC `ai-service.GenerateReviewSummary({ productId })` (fire-and-forget, không block response)
  - Hoặc: emit SQS message → ai-service consume

- [ ] 3.2 Logic invalidation trong ai-service
  - `GenerateReviewSummary` handler:
    1. Đếm reviews hiện tại cho product
    2. Nếu < 5 reviews → skip (không đủ data)
    3. Nếu đã có summary VÀ `reviewCount` chênh < 3 VÀ `updatedAt` < 7 ngày → skip (cache còn valid)
    4. Ngược lại → lấy reviews, gọi AI, upsert summary

- [ ] 3.3 Manual trigger (admin)
  - Admin-web có thể gọi `POST /ai/review-summary/generate/:productId` để force regenerate
  - Hữu ích khi cần refresh summary ngay

## Phase 4: Testing + Polish

- [ ] 4.1 Test end-to-end
  - Tạo 5+ reviews cho 1 product
  - Trigger generate → verify summary xuất hiện
  - Tạo thêm 3 reviews → verify summary được regenerate

- [ ] 4.2 Error handling
  - Groq API down → log error, không crash
  - AI trả format sai → retry 1 lần, nếu vẫn sai → skip, log warning
  - Product không có reviews → return null gracefully

- [ ] 4.3 Rate limiting
  - Không gọi AI quá 1 lần/product/5 phút (debounce)
  - Dùng `updatedAt` check: nếu summary vừa được update < 5 phút → skip

- [ ] 4.4 Build + Deploy
  - Full build: `pnpm nx run-many -t build --projects=ai-service,customer-bff,customer-web,utility-service`
  - Thêm ai-service vào `package.json` scripts `dev`
  - Thêm Helm chart / Terraform nếu cần deploy

## Ghi chú kỹ thuật

### Tại sao tạo ai-service riêng?

- **Separation of concerns**: AI logic tách biệt khỏi business logic
- **Scalability**: có thể scale riêng (AI calls chậm, cần nhiều memory)
- **Extensibility**: sau này thêm features AI khác (product description generation, chatbot, recommendation) vào cùng service
- **Cost tracking**: dễ monitor Groq API usage riêng

### Tại sao cache vào DB thay vì Redis?

- Data ít thay đổi (max 1 lần/7 ngày/product)
- Cần persistent (survive restart)
- Query đơn giản (findUnique by productId — indexed)
- Redis phù hợp cho hot data (session, rate limit) — không phải case này

### Tại sao dùng Groq + Kimi K2?

- **Free tier rộng**: 14,400 requests/day
- **Nhanh**: Groq inference rất nhanh (< 2s cho text generation)
- **Chất lượng**: Kimi K2 hiểu tiếng Việt tốt
- **Đã proven**: echo project dùng thành công

### Model fallback

- Primary: `groq('moonshotai/kimi-k2-instruct-0905')`
- Fallback (nếu Groq down): có thể thêm `@ai-sdk/google` với `google('gemini-2.5-flash')` sau
