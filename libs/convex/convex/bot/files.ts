import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { ConvexError, v } from 'convex/values';
import { action, mutation, query } from '../_generated/server';
import rag from './rag';

export const addFile = action({
  args: {
    filename: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { bytes, filename, mimeType, category } = args;
    const blob = new Blob([bytes], { type: mimeType });
    const storageId = await ctx.storage.store(blob);

    // Extract text
    let text: string;
    if (mimeType.includes('text') || mimeType.includes('plain')) {
      text = new TextDecoder().decode(bytes);
    } else {
      // Use AI to extract text from PDF/images
      const url = await ctx.storage.getUrl(storageId);
      if (!url)
        throw new ConvexError({
          code: 'ERROR',
          message: 'Failed to get file URL',
        });

      const result = await generateText({
        model: groq('openai/gpt-oss-120b'),
        messages: [
          {
            role: 'system',
            content:
              'Extract all text content from this document. Return only the text, no explanations.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'file',
                data: new URL(url),
                mediaType: mimeType,
                filename,
              },
            ],
          },
        ],
      });
      text = result.text;
    }

    // Index into RAG
    await rag.add(ctx, {
      namespace: 'vshop',
      text,
      key: filename,
      title: filename,
      metadata: { storageId, filename, category: category ?? null },
    });

    // Track in our table
    await ctx.runMutation('bot/files:_trackFile' as any, {
      title: filename,
      category,
      storageId,
    });

    return { success: true };
  },
});

export const _trackFile = mutation({
  args: {
    title: v.string(),
    category: v.optional(v.string()),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('botKnowledgeBase', {
      title: args.title,
      category: args.category,
      storageId: args.storageId,
      status: 'ready',
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('botKnowledgeBase').order('desc').collect();
  },
});

export const deleteFile = mutation({
  args: { id: v.id('botKnowledgeBase') },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file)
      throw new ConvexError({ code: 'NOT_FOUND', message: 'File not found' });
    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(args.id);
  },
});
