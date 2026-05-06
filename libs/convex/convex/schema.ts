import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Schema cho hệ thống chat 1-1.
// - `conversations`: bản ghi 1-1 giữa 2 user. `participantsKey` là 2 userId
//   sort lexicographic và join `:` để lookup nhanh và đảm bảo duy nhất 1 cuộc
//   trò chuyện cho mỗi cặp.
// - `conversationMembers`: join table. Một cuộc trò chuyện có 2 hàng (mỗi user
//   1 hàng). Lưu snapshot tên + avatar của peer để render danh sách inbox mà
//   không cần fetch IAM. Index theo `[userId, lastMessageAt]` để phân trang
//   inbox theo thời gian.
// - `messages`: nội dung hội thoại. `kind` = `text` | `image`. Với `image`,
//   `body` là URL ảnh.
export default defineSchema({
  conversations: defineTable({
    participantsKey: v.string(),
    participants: v.array(v.string()),
    lastMessage: v.optional(
      v.object({
        body: v.string(),
        senderId: v.string(),
        kind: v.union(v.literal('text'), v.literal('image')),
        createdAt: v.number(),
      }),
    ),
    lastMessageAt: v.number(),
  }).index('by_participants_key', ['participantsKey']),

  conversationMembers: defineTable({
    conversationId: v.id('conversations'),
    userId: v.string(),
    peerId: v.string(),
    peerName: v.string(),
    peerAvatar: v.string(),
    lastMessageAt: v.number(),
    lastMessagePreview: v.optional(v.string()),
  })
    .index('by_user_lastMessageAt', ['userId', 'lastMessageAt'])
    .index('by_user_peer', ['userId', 'peerId'])
    .index('by_conversation', ['conversationId']),

  messages: defineTable({
    conversationId: v.id('conversations'),
    senderId: v.string(),
    kind: v.union(v.literal('text'), v.literal('image')),
    body: v.string(),
  }).index('by_conversation', ['conversationId']),
});
