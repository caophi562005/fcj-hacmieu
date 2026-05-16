# Kế hoạch thực hiện: AI Chatbot Widget

## Phase 1: Convex Backend — Agent + RAG Setup

- [ ] 1.1 Cài dependencies cho `libs/convex`
  - Thêm vào `package.json` (nếu libs/convex có riêng) hoặc root:
    - `@convex-dev/agent: ^0.3.2`
    - `@convex-dev/rag: ^0.7.0`
    - `@ai-sdk/groq: ^2.0.34`
    - `@ai-sdk/google: ^3.0.23`
    - `ai: ^5.0.129`
  - `pnpm install`

- [ ] 1.2 Tạo `libs/convex/convex/convex.config.ts`
  - Register `agent` và `rag` components
  - ```typescript
    import agent from '@convex-dev/agent/convex.config';
    import rag from '@convex-dev/rag/convex.config';
    import { defineApp } from 'convex/server';
    const app = defineApp();
    app.use(agent);
    app.use(rag);
    export default app;
    ```

- [ ] 1.3 Cập nhật `libs/convex/convex/schema.ts`
  - Thêm tables: `botConversations`, `botKnowledgeBase`
  - `botConversations`: sessionId, threadId, status, createdAt, expiresAt
  - `botKnowledgeBase`: title, category, storageId, status, createdAt
  - Giữ nguyên tables hiện có (conversations, conversationMembers, messages)

- [ ] 1.4 Tạo `libs/convex/convex/bot/agent.ts`
  - Tạo `shopBot` agent với Groq model
  - System prompt tiếng Việt cho hỗ trợ khách hàng V-Shop
  - Tools: searchTool (RAG), resolveConversationTool

- [ ] 1.5 Tạo `libs/convex/convex/bot/rag.ts`
  - Khởi tạo RAG instance với Google embedding model
  - Namespace: `'vshop'` (single tenant)

- [ ] 1.6 Tạo `libs/convex/convex/bot/tools/search.ts`
  - Tool search knowledge base
  - Gọi `rag.search()` → interpret results → trả lời

- [ ] 1.7 Tạo `libs/convex/convex/bot/conversations.ts`
  - Mutations: `create` (tạo conversation + thread + greeting), `resolve`
  - Queries: `getBySession` (lấy active conversation cho session)

- [ ] 1.8 Tạo `libs/convex/convex/bot/messages.ts`
  - Action: `send` (user gửi message → trigger agent)
  - Query: `list` (paginated messages cho thread, exclude tool messages)

- [ ] 1.9 Tạo `libs/convex/convex/bot/files.ts`
  - Action: `addFile` (upload + extract text + index RAG)
  - Mutation: `deleteFile` (xoá từ RAG + storage)
  - Query: `list` (danh sách files trong knowledge base)

- [ ] 1.10 Tạo `libs/convex/convex/bot/cleanup.ts`
  - Cron job: mỗi giờ xoá `botConversations` có `expiresAt < now`
  - Xoá cả thread messages (nếu agent API hỗ trợ)

- [ ] 1.11 Deploy Convex
  - `cd libs/convex && npx convex dev` (hoặc `npx convex deploy`)
  - Set env vars trên Convex dashboard: `GROQ_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`
  - Verify schema push thành công

## Phase 2: Customer-Web — Chat Widget UI

- [ ] 2.1 Tạo `apps/webs/customer-web/src/components/ChatBotWidget.tsx`
  - Client component (`'use client'`)
  - State: `isOpen` (toggle bubble/panel)
  - Bubble button: fixed bottom-right, icon chat, click toggle
  - Panel: 400x600px, header + messages + input
  - Dùng `useConvex` hooks cho real-time

- [ ] 2.2 Tạo `apps/webs/customer-web/src/components/ChatBotMessages.tsx`
  - Dùng `useThreadMessages` từ `@convex-dev/agent/react`
  - Render messages (user vs bot bubbles)
  - Auto-scroll xuống cuối khi có tin mới
  - Infinite scroll load tin cũ

- [ ] 2.3 Tạo `apps/webs/customer-web/src/components/ChatBotInput.tsx`
  - Input + nút gửi
  - Gọi Convex action `bot.messages.send` khi submit
  - Disable khi conversation resolved

- [ ] 2.4 Session management
  - Tạo `sessionId` bằng `nanoid` lưu localStorage
  - Khi widget mở: check có active conversation không (query `bot.conversations.getBySession`)
  - Nếu không có hoặc expired → tạo mới (mutation `bot.conversations.create`)

- [ ] 2.5 Tích hợp vào layout
  - Thêm `<ChatBotWidget />` vào `apps/webs/customer-web/src/app/layout.tsx`
  - Chỉ render khi user ở customer-web (không render ở /login, /chat)
  - Lazy load component (dynamic import)

- [ ] 2.6 Styling
  - Dùng Tailwind classes từ web-theme (primary, surface, ink colors)
  - Responsive: mobile full-width, desktop 400px
  - Animation: slide-up khi mở, fade-out khi đóng
  - Z-index cao hơn BottomNav

- [ ] 2.7 Build verification
  - `pnpm nx build customer-web --skip-nx-cache`

## Phase 3: Admin-Web — Knowledge Base Management

- [ ] 3.1 Tạo trang `/knowledge-base` trong admin-web
  - `apps/webs/admin-web/src/app/knowledge-base/page.tsx`
  - Danh sách tài liệu: tên, category, status (processing/ready/error), size
  - Nút "Upload tài liệu"
  - Nút xoá từng tài liệu

- [ ] 3.2 Tạo Upload Dialog
  - Dropzone cho file (PDF, TXT, DOCX)
  - Input: category (optional), filename (optional)
  - Gọi Convex action `bot.files.addFile`
  - Show progress/loading state

- [ ] 3.3 Thêm nav item vào admin sidebar
  - Icon: `Brain` hoặc `BookOpen` từ lucide-react
  - Label: "Knowledge Base"
  - Href: `/knowledge-base`

- [ ] 3.4 Build verification
  - `pnpm nx build admin-web --skip-nx-cache`

## Phase 4: Testing + Polish

- [ ] 4.1 Test end-to-end
  - Upload 1 tài liệu RAG (ví dụ: FAQ về V-Shop)
  - Mở customer-web → click bubble → chat
  - Hỏi câu hỏi liên quan đến tài liệu → bot trả lời đúng
  - Hỏi câu không liên quan → bot nói không biết

- [ ] 4.2 Test cleanup
  - Tạo conversation → đợi 24h (hoặc manually set expiresAt trong quá khứ)
  - Verify cron xoá conversation

- [ ] 4.3 Error handling
  - Groq API down → bot trả "Xin lỗi, hệ thống đang bận"
  - Convex connection lost → show reconnecting state
  - File upload fail → show error toast

- [ ] 4.4 Performance
  - Widget lazy-loaded (không ảnh hưởng initial page load)
  - Messages paginated (không load tất cả cùng lúc)
  - RAG search limit 5 results

## Ghi chú kỹ thuật

### Tại sao dùng Convex thay vì NestJS cho chatbot?

- **Real-time native**: Convex subscriptions = tin nhắn hiện ngay lập tức, không cần SSE/WebSocket setup
- **Agent SDK**: `@convex-dev/agent` handle thread management, message storage, tool execution
- **RAG SDK**: `@convex-dev/rag` handle embedding, indexing, search — không cần vector DB riêng
- **Đã có infrastructure**: `libs/convex` đã deploy, đã có Convex URL
- **Cron built-in**: Convex scheduled functions, không cần AWS EventBridge

### Tại sao anonymous (không cần auth)?

- Chatbot hỗ trợ = public service, user chưa login cũng cần hỏi
- Giảm friction: click → chat ngay, không cần nhập email
- Session ID đủ để track conversation

### Tại sao TTL 24h?

- Chatbot support = short-lived conversations
- Không cần lưu lịch sử lâu (khác với chat 1-1 giữa user-seller)
- Tiết kiệm storage Convex
- Privacy: không giữ data user quá lâu

### Tại sao Convex cron thay vì AWS Schedule?

- Data trong Convex → cron truy cập trực tiếp DB
- Không cần Lambda + API Gateway + auth
- Free tier Convex hỗ trợ cron
- Đơn giản: 1 file TypeScript

### Embedding model

- Dùng Google `gemini-embedding-001` (3072 dimensions) — giống echo
- Free tier Google AI: 1500 requests/day cho embedding
- Chỉ chạy khi upload tài liệu (không chạy mỗi query — RAG search dùng pre-computed embeddings)

### Giới hạn

- Max 5 RAG results per search
- Max 100 messages per conversation (paginated)
- Max file size: 10MB
- Supported formats: PDF, TXT, DOCX
- 1 active conversation per session (tạo mới nếu cũ resolved/expired)
