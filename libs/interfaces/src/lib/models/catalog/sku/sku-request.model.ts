import { SKUSchema } from '@common/schemas/product';
import z from 'zod';

export const GetSKURequestSchema = SKUSchema.pick({
  id: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const IncreaseStockRequestSchema = z.object({
  items: z.array(
    z.object({
      skuId: z.uuid(),
      quantity: z.number().min(1),
      productId: z.uuid(),
    })
  ),
});

export type GetSKURequest = z.infer<typeof GetSKURequestSchema>;
export type IncreaseStockRequest = z.infer<typeof IncreaseStockRequestSchema>;
