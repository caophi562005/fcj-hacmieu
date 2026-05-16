import { groq } from '@ai-sdk/groq';
import { createTool } from '@convex-dev/agent';
import { generateText } from 'ai';
import z from 'zod';
import { shopBot } from '../agent';
import rag from '../rag';

const SEARCH_INTERPRETER_PROMPT = `
Bạn diễn giải kết quả tìm kiếm và trả lời câu hỏi của khách hàng.
- Nếu tìm thấy thông tin → trả lời rõ ràng, ngắn gọn bằng tiếng Việt
- Nếu không tìm thấy → nói "Tôi không tìm thấy thông tin về vấn đề này."
- KHÔNG bịa đặt thông tin
- Trả lời dưới dạng text thuần, không markdown
`;

export const searchTool = createTool({
  description:
    'Tìm kiếm thông tin trong knowledge base để trả lời câu hỏi khách hàng',
  args: z.object({
    query: z.string().describe('Câu hỏi cần tìm kiếm'),
  }),
  handler: async (ctx, args) => {
    const searchResult = await rag.search(ctx, {
      namespace: 'vshop',
      query: args.query,
      limit: 5,
    });

    if (!searchResult.text || searchResult.entries.length === 0) {
      return 'Không tìm thấy thông tin liên quan trong knowledge base.';
    }

    const response = await generateText({
      model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
      messages: [
        { role: 'system', content: SEARCH_INTERPRETER_PROMPT },
        {
          role: 'user',
          content: `Câu hỏi: "${args.query}"\n\nKết quả tìm kiếm:\n${searchResult.text}`,
        },
      ],
    });

    if (ctx.threadId) {
      await shopBot.saveMessage(ctx, {
        threadId: ctx.threadId,
        message: { role: 'assistant', content: response.text },
      });
    }

    return searchResult.text;
  },
});
