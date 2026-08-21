import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { action, query } from '../_generated/server';
import { internal } from '../_generated/api';
import { shopBot } from './agent';
import { validateSessionId } from './session';
import { searchTool } from './tools/search';

const MAX_PROMPT_LENGTH = 1000;

export const send = action({
  args: {
    threadId: v.string(),
    sessionId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    validateSessionId(args.sessionId);
    const prompt = args.prompt.trim();
    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
      throw new ConvexError({
        code: 'BAD_REQUEST',
        message: `Prompt must contain 1-${MAX_PROMPT_LENGTH} characters`,
      });
    }

    // Authorization and rate limiting happen atomically before invoking the
    // external model so concurrent requests cannot bypass the limit.
    await ctx.runMutation(internal.bot.conversations.authorizeAndConsume, {
      sessionId: args.sessionId,
      threadId: args.threadId,
    });

    await shopBot.generateText(
      ctx,
      { threadId: args.threadId },
      {
        prompt,
        tools: { searchTool },
        // gpt-oss là reasoning model: mặc định nó chèn cả chain-of-thought
        // vào câu trả lời. 'hidden' để khách chỉ thấy phần trả lời cuối.
        providerOptions: { groq: { reasoningFormat: 'hidden' } },
      },
    );
  },
});

export const list = query({
  args: {
    threadId: v.string(),
    sessionId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    validateSessionId(args.sessionId);
    const conversation = await ctx.db
      .query('botConversations')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .order('desc')
      .first();
    if (
      !conversation ||
      conversation.threadId !== args.threadId ||
      conversation.status !== 'active' ||
      conversation.expiresAt < Date.now()
    ) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Invalid session or conversation',
      });
    }
    return shopBot.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
      excludeToolMessages: true,
    });
  },
});
