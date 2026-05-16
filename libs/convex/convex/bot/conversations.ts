import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { shopBot } from './agent';

const BOT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query('botConversations')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .order('desc')
      .first();

    if (!conversation) return null;
    if (conversation.expiresAt < Date.now()) return null;
    if (conversation.status === 'resolved') return null;

    return conversation;
  },
});

export const create = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();

    const { threadId } = await shopBot.createThread(ctx, {});

    // Greeting message
    await shopBot.saveMessage(ctx, {
      threadId,
      message: {
        role: 'assistant',
        content:
          'Xin chào! 👋 Tôi là trợ lý AI của V-Shop. Tôi có thể giúp bạn tìm hiểu về sản phẩm, đơn hàng, hoặc chính sách. Hãy hỏi tôi bất cứ điều gì!',
      },
    });

    const conversationId = await ctx.db.insert('botConversations', {
      sessionId: args.sessionId,
      threadId,
      status: 'active',
      createdAt: now,
      expiresAt: now + BOT_TTL_MS,
    });

    return conversationId;
  },
});

export const resolve = mutation({
  args: { conversationId: v.id('botConversations') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { status: 'resolved' });
  },
});
