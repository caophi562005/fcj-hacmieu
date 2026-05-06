import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';

function buildKey(a: string, b: string): string {
  return [a, b].sort().join(':');
}

/**
 * Lấy hoặc tạo cuộc trò chuyện 1-1 giữa `userId` và `peerId`.
 * Idempotent: gọi nhiều lần với cùng cặp luôn trả cùng `conversationId`.
 * Lưu snapshot tên + avatar 2 phía để inbox không cần JOIN ngoài.
 */
export const getOrCreate = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.string(),
    peerId: v.string(),
    peerName: v.string(),
    peerAvatar: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.userId === args.peerId) {
      throw new ConvexError({
        code: 'BAD_REQUEST',
        message: 'Không thể tự chat với chính mình',
      });
    }

    // Đã có chưa?
    const existingMember = await ctx.db
      .query('conversationMembers')
      .withIndex('by_user_peer', (q) =>
        q.eq('userId', args.userId).eq('peerId', args.peerId),
      )
      .unique();

    if (existingMember) {
      return existingMember.conversationId;
    }

    const now = Date.now();
    const conversationId = await ctx.db.insert('conversations', {
      participantsKey: buildKey(args.userId, args.peerId),
      participants: [args.userId, args.peerId],
      lastMessageAt: now,
    });

    await ctx.db.insert('conversationMembers', {
      conversationId,
      userId: args.userId,
      peerId: args.peerId,
      peerName: args.peerName,
      peerAvatar: args.peerAvatar,
      lastMessageAt: now,
    });

    await ctx.db.insert('conversationMembers', {
      conversationId,
      userId: args.peerId,
      peerId: args.userId,
      peerName: args.userName,
      peerAvatar: args.userAvatar,
      lastMessageAt: now,
    });

    return conversationId;
  },
});

/**
 * Phân trang danh sách cuộc trò chuyện của `userId`, sắp xếp giảm dần theo
 * `lastMessageAt`. Trả về snapshot peer để render trực tiếp.
 */
export const list = query({
  args: {
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('conversationMembers')
      .withIndex('by_user_lastMessageAt', (q) => q.eq('userId', args.userId))
      .order('desc')
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map((m) => ({
        _id: m._id,
        conversationId: m.conversationId,
        peerId: m.peerId,
        peerName: m.peerName,
        peerAvatar: m.peerAvatar,
        lastMessageAt: m.lastMessageAt,
        lastMessagePreview: m.lastMessagePreview,
      })),
    };
  },
});

/**
 * Chi tiết một cuộc trò chuyện. Validate `userId` phải là participant.
 */
export const getOne = query({
  args: {
    conversationId: v.id('conversations'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Không tìm thấy cuộc trò chuyện',
      });
    }
    if (!conversation.participants.includes(args.userId)) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Bạn không phải thành viên cuộc trò chuyện này',
      });
    }

    const member = await ctx.db
      .query('conversationMembers')
      .withIndex('by_user_peer', (q) =>
        q
          .eq('userId', args.userId)
          .eq(
            'peerId',
            conversation.participants.find((p) => p !== args.userId) ?? '',
          ),
      )
      .unique();

    return {
      _id: conversation._id,
      participants: conversation.participants,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      peerId: member?.peerId ?? '',
      peerName: member?.peerName ?? '',
      peerAvatar: member?.peerAvatar ?? '',
    };
  },
});
