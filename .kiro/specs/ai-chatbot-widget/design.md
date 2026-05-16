# Thiết kế: AI Chatbot Widget cho Customer-Web

## Tổng quan

Tạo chatbot AI hỗ trợ khách hàng trên customer-web. User click bong bóng chat → mở khung chat → chat với bot AI. Bot trả lời dựa trên knowledge base (RAG). Admin upload tài liệu RAG qua admin-web.

## Kiến trúc (học từ echo project)

```
┌─────────────────┐     Convex Real-time     ┌──────────────────────┐
│  customer-web   │ ◄──────────────────────► │   Convex Backend     │
│  (Chat Widget)  │                          │  (libs/convex)       │
└─────────────────┘                          │                      │
                                             │  ┌────────────────┐  │
┌─────────────────┐                          │  │ @convex-dev/   │  │
│   admin-web     │ ◄──────────────────────► │  │   agent        │  │
│  (RAG Upload)   │                          │  │ @convex-dev/   │  │
└─────────────────┘                          │  │   rag          │  │
                                             │  └────────────────┘  │
                                             │         │            │
                                             │         ▼            │
                                             │  ┌────────────────┐  │
                                             │  │  Groq API      │  │
                                             │  │  (Kimi K2)     │  │
                                             │  └────────────────┘  │
                                             └──────────────────────┘
```

## Khác biệt so với echo

| Aspect       | Echo                         | V-Shop                                               |
| ------------ | ---------------------------- | ---------------------------------------------------- |
| Auth widget  | Contact session (name+email) | Không cần auth — anonymous chat                      |
| Multi-tenant | Org-based namespace          | Single bot cho toàn website (1 knowledge base chung) |
| Embed        | Separate iframe app          | Inline component trong customer-web                  |
| Chat history | Persistent per session       | TTL 24h, cron xoá                                    |
| Admin        | Clerk org dashboard          | admin-web existing                                   |

## Convex Schema mới (thêm vào `libs/convex/convex/schema.ts`)

```typescript
// Thêm tables cho AI chatbot:
botConversations: defineTable({
  sessionId: v.string(),       // anonymous session ID (localStorage)
  threadId: v.string(),        // @convex-dev/agent thread
  status: v.union(v.literal('active'), v.literal('resolved')),
  createdAt: v.number(),
  expiresAt: v.number(),       // TTL: createdAt + 24h
}).index('by_session', ['sessionId'])
  .index('by_expires_at', ['expiresAt']),

botKnowledgeBase: defineTable({
  title: v.string(),
  category: v.optional(v.string()),
  storageId: v.id('_storage'),
  status: v.union(v.literal('processing'), v.literal('ready'), v.literal('error')),
  createdAt: v.number(),
}).index('by_status', ['status']),
```

## Convex Config (cập nhật `libs/convex/convex.config.ts` — CHƯA CÓ)

```typescript
import agent from '@convex-dev/agent/convex.config';
import rag from '@convex-dev/rag/convex.config';
import { defineApp } from 'convex/server';

const app = defineApp();
app.use(agent);
app.use(rag);

export default app;
```

**LƯU Ý**: Hiện tại `libs/convex` KHÔNG dùng `@convex-dev/agent` hay `@convex-dev/rag`. Cần cài thêm dependencies và tạo `convex.config.ts`.

## AI Agent (trong `libs/convex/convex/`)

```typescript
// convex/bot/agent.ts
import { groq } from '@ai-sdk/groq';
import { Agent } from '@convex-dev/agent';
import { components } from '../_generated/api';

export const shopBot = new Agent(components.agent, {
  name: 'shopBot',
  languageModel: groq('moonshotai/kimi-k2-instruct-0905'),
  instructions: SHOP_BOT_PROMPT,
});
```

**Prompt**: Bot hỗ trợ khách hàng V-Shop. Tìm kiếm knowledge base trước khi trả lời. Nếu không tìm thấy → "Xin lỗi, tôi không có thông tin về vấn đề này."

## RAG (Knowledge Base)

```typescript
// convex/bot/rag.ts
import { google } from '@ai-sdk/google';
import { RAG } from '@convex-dev/rag';
import { components } from '../_generated/api';

const rag = new RAG(components.rag, {
  textEmbeddingModel: google.embeddingModel('gemini-embedding-001'),
  embeddingDimension: 3072,
});

export default rag;
```

## Frontend — Chat Widget (customer-web)

### Component: `ChatBotWidget`

Bong bóng chat ở góc dưới phải. Click → mở khung chat 400x600px.

```
┌─────────────────────────┐
│  🤖 V-Shop Assistant    │
├─────────────────────────┤
│                         │
│  Bot: Xin chào! Tôi    │
│  có thể giúp gì?       │
│                         │
│         User: Giá ship? │
│                         │
│  Bot: Phí ship từ 0đ   │
│  cho đơn trên 500k...  │
│                         │
├─────────────────────────┤
│  [Nhập tin nhắn...]  ➤ │
└─────────────────────────┘
                        [💬] ← bubble button
```

### Session Management

- Tạo `sessionId` random (nanoid) lưu vào `localStorage`
- Mỗi session có 1 conversation (hoặc tạo mới nếu cũ đã expired)
- Không cần user nhập name/email (anonymous)

### Real-time Messages

Dùng `useThreadMessages` từ `@convex-dev/agent/react` — giống echo widget.

## Admin-web — RAG Upload

### Trang `/knowledge-base`

- Danh sách tài liệu đã upload (tên, category, status, size)
- Nút "Upload tài liệu" → dialog upload (PDF, TXT, DOCX)
- Nút xoá tài liệu

### Upload Flow (giống echo)

1. Admin chọn file + nhập category
2. Upload file → Convex storage
3. Extract text (AI cho PDF/image, direct cho TXT)
4. Index vào RAG với namespace global

## Cleanup — Cron Job (Convex Scheduled Functions)

```typescript
// convex/bot/cleanup.ts
import { cronJobs } from 'convex/server';

const crons = cronJobs();

// Chạy mỗi giờ: xoá conversations expired > 24h
crons.hourly('cleanup expired bot conversations', async (ctx) => {
  const now = Date.now();
  const expired = await ctx.db
    .query('botConversations')
    .withIndex('by_expires_at', (q) => q.lt('expiresAt', now))
    .take(100);

  for (const conv of expired) {
    await ctx.db.delete(conv._id);
    // Agent messages tự cleanup khi thread bị orphan
  }
});

export default crons;
```

**Tại sao dùng Convex cron thay vì AWS Schedule?**

- Data nằm trong Convex → cron trong Convex truy cập trực tiếp, không cần API call
- Đơn giản hơn: 1 file, không cần Lambda/EventBridge
- Free tier Convex hỗ trợ cron

## Dependencies cần cài

```json
// Thêm vào root package.json hoặc libs/convex package:
"@convex-dev/agent": "^0.3.2",
"@convex-dev/rag": "^0.7.0",
"@ai-sdk/groq": "^2.0.34",
"@ai-sdk/google": "^3.0.23",
"ai": "^5.0.129"
```

## Environment Variables

```env
# Đã có:
NEXT_PUBLIC_CONVEX_URL=https://fiery-walrus-247.convex.cloud

# Cần thêm (Convex dashboard → Settings → Environment Variables):
GROQ_API_KEY=gsk_...
GOOGLE_GENERATIVE_AI_API_KEY=...  (cho embedding model)
```

## Tóm tắt flow

### Customer chat:

1. User click bubble → widget mở
2. Check localStorage cho `sessionId` → tạo mới nếu chưa có
3. Tạo/lấy `botConversation` (Convex mutation)
4. User gửi message → `shopBot.generateText()` với RAG search tool
5. Bot trả lời real-time (Convex subscription)
6. Sau 24h → cron xoá conversation + messages

### Admin upload RAG:

1. Admin vào `/knowledge-base`
2. Upload file → Convex storage → extract text → index RAG
3. Bot tự động dùng knowledge base mới khi search
