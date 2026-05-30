import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

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

  // --- AI Chatbot (bot) ---
  botConversations: defineTable({
    sessionId: v.string(),
    threadId: v.string(),
    status: v.union(v.literal('active'), v.literal('resolved')),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index('by_session', ['sessionId'])
    .index('by_expires_at', ['expiresAt']),

  botKnowledgeBase: defineTable({
    title: v.string(),
    category: v.optional(v.string()),
    storageId: v.id('_storage'),
    status: v.union(
      v.literal('processing'),
      v.literal('ready'),
      v.literal('error'),
    ),
    createdAt: v.number(),
  }).index('by_status', ['status']),
});
