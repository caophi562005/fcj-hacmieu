import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { action, query } from '../_generated/server';
import { shopBot } from './agent';
import { searchTool } from './tools/search';

export const send = action({
  args: {
    threadId: v.string(),
    sessionId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate session has active conversation
    const conversation = await ctx.runQuery(
      'bot/conversations:getBySession' as any,
      { sessionId: args.sessionId },
    );

    if (!conversation || conversation.threadId !== args.threadId) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Invalid session or conversation',
      });
    }

    await shopBot.generateText(
      ctx,
      { threadId: args.threadId },
      {
        prompt: args.prompt,
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
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return shopBot.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
      excludeToolMessages: true,
    });
  },
});
