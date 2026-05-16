import { internalMutation } from '../_generated/server';

export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('botConversations')
      .withIndex('by_expires_at', (q) => q.lt('expiresAt', now))
      .take(100);

    for (const conv of expired) {
      await ctx.db.delete(conv._id);
    }

    return { deleted: expired.length };
  },
});
