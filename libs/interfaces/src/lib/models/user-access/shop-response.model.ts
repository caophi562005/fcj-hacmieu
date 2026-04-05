import { ShopSchema } from '@common/schemas/user-access';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';
import { ResponseSchema } from '../common/response.model';

export const ShopResponseSchema = ShopSchema;

export const ValidateShopsResponseSchema = z.object({
  shops: z.array(
    ShopSchema.pick({
      id: true,
      name: true,
    })
  ),
});

export const GetManyShopsResponseSchema = PaginationQueryResponseSchema.extend({
  shops: z.array(ShopSchema),
});

export const GetShopResponseSchema = ResponseSchema(ShopSchema);

export type ShopResponse = z.infer<typeof ShopResponseSchema>;
export type GetManyShopsResponse = z.infer<typeof GetManyShopsResponseSchema>;
export type ValidateShopsResponse = z.infer<typeof ValidateShopsResponseSchema>;
