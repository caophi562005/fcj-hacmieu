import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireUserId } from './auth';

const PREVIEW_MAX = 80;

function buildPreview(kind: 'text' | 'image', body: string): string {
  if (kind === 'image') return '[Hình ảnh]';
  return body.length > PREVIEW_MAX ? body.slice(0, PREVIEW_MAX) + '…' : body;
}

// Phân trang nội dung tin nhắn của một cuộc trò chuyện. Sắp xếp giảm dần theo thời gian tạo
export const list = query({
  args: {
    conversationId: v.id('conversations'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Không tìm thấy cuộc trò chuyện',
      });
    }
    if (!conversation.participants.includes(userId)) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Bạn không phải thành viên cuộc trò chuyện này',
      });
    }

    return await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId),
      )
      .order('desc')
      .paginate(args.paginationOpts);
  },
});

// Gửi 1 tin nhắn (text hoặc image-url). Cập nhật `lastMessage*` của
// conversation và 2 conversationMembers trong cùng transaction.
export const send = mutation({
  args: {
    conversationId: v.id('conversations'),
    kind: v.union(v.literal('text'), v.literal('image')),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const trimmed = args.body.trim();
    if (!trimmed) {
      throw new ConvexError({
        code: 'BAD_REQUEST',
        message: 'Tin nhắn rỗng',
      });
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Không tìm thấy cuộc trò chuyện',
      });
    }
    if (!conversation.participants.includes(userId)) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Bạn không phải thành viên cuộc trò chuyện này',
      });
    }

    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      senderId: userId,
      kind: args.kind,
      body: trimmed,
    });

    const now = Date.now();
    const preview = buildPreview(args.kind, trimmed);

    await ctx.db.patch(args.conversationId, {
      lastMessage: {
        body: trimmed,
        senderId: userId,
        kind: args.kind,
        createdAt: now,
      },
      lastMessageAt: now,
    });

    const members = await ctx.db
      .query('conversationMembers')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId),
      )
      .collect();

    await Promise.all(
      members.map((m) =>
        ctx.db.patch(m._id, {
          lastMessageAt: now,
          lastMessagePreview: preview,
        }),
      ),
    );

    return messageId;
  },
});
