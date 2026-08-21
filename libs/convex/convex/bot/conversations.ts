import { ConvexError, v } from 'convex/values';
import { internalMutation, mutation, query } from '../_generated/server';
import { shopBot } from './agent';
import { validateSessionId } from './session';

const BOT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RATE_WINDOW_MS = 60 * 1000;
const MAX_MESSAGES_PER_WINDOW = 10;
export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    validateSessionId(args.sessionId);
    const conversation = await ctx.db
      .query('botConversations')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .order('desc')
      .first();

    if (!conversation) return null;
    if (conversation.expiresAt < Date.now()) return null;
    if (conversation.status === 'resolved') return null;

    return {
      _id: conversation._id,
      threadId: conversation.threadId,
      status: conversation.status,
      expiresAt: conversation.expiresAt,
    };
  },
});

export const create = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    validateSessionId(args.sessionId);
    const now = Date.now();

    const existing = await ctx.db
      .query('botConversations')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .order('desc')
      .first();

    if (existing && existing.status === 'active' && existing.expiresAt > now) {
      return existing._id;
    }

    const identity = await ctx.auth.getUserIdentity();

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
      ...(identity ? { ownerId: identity.subject } : {}),
      status: 'active',
      createdAt: now,
      expiresAt: now + BOT_TTL_MS,
      rateWindowStartedAt: now,
      rateCount: 0,
    });

    return conversationId;
  },
});

export const resolve = mutation({
  args: {
    conversationId: v.id('botConversations'),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    validateSessionId(args.sessionId);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.sessionId !== args.sessionId) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Conversation not found',
      });
    }
    await ctx.db.patch(args.conversationId, { status: 'resolved' });
  },
});

export const authorizeAndConsume = internalMutation({
  args: {
    sessionId: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    validateSessionId(args.sessionId);
    const now = Date.now();
    const conversation = await ctx.db
      .query('botConversations')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .order('desc')
      .first();

    if (
      !conversation ||
      conversation.threadId !== args.threadId ||
      conversation.status !== 'active' ||
      conversation.expiresAt < now
    ) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Invalid session or conversation',
      });
    }

    const windowStartedAt = conversation.rateWindowStartedAt ?? now;
    const count = conversation.rateCount ?? 0;
    if (now - windowStartedAt < RATE_WINDOW_MS) {
      if (count >= MAX_MESSAGES_PER_WINDOW) {
        throw new ConvexError({
          code: 'RATE_LIMITED',
          message: 'Too many messages. Please wait a moment.',
        });
      }
      await ctx.db.patch(conversation._id, { rateCount: count + 1 });
    } else {
      await ctx.db.patch(conversation._id, {
        rateWindowStartedAt: now,
        rateCount: 1,
      });
    }
  },
});
