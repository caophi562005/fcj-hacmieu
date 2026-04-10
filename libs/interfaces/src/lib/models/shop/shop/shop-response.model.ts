import { ShopSchema } from '@common/schemas/shop';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const ShopResponseSchema = ShopSchema;

export const GetManyShopsResponseSchema = PaginationQueryResponseSchema.extend({
  shops: z.array(ShopResponseSchema),
});

export type ShopResponse = z.infer<typeof ShopResponseSchema>;
export type GetManyShopsResponse = z.infer<typeof GetManyShopsResponseSchema>;
