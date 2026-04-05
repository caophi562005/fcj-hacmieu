import { CartItemSchema } from '@common/schemas/cart';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../common/pagination.model';

export const GetManyCartItemsRequestSchema =
  PaginationQueryRequestSchema.extend({
    userId: z.uuid(),
  })
    .extend({
      processId: z.uuid().optional(),
    })
    .strict();

export const GetUniqueCartItemRequestSchema = CartItemSchema.pick({
  cartId: true,
  productId: true,
  skuId: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const AddCartItemRequestSchema = CartItemSchema.pick({
  productId: true,
  skuId: true,
  shopId: true,
  quantity: true,
  skuValue: true,
  productName: true,
  productImage: true,
})
  .extend({
    userId: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateCartItemRequestSchema = AddCartItemRequestSchema;

export const DeleteCartItemRequestSchema = z.object({
  userId: z.uuid(),
  cartItemId: z.uuid(),
  productId: z.uuid().optional(),
  skuId: z.uuid().optional(),
  processId: z.uuid().optional(),
});

export const ValidateCartItemsRequestSchema = z.object({
  cartItemIds: z.array(z.uuid()),
  processId: z.uuid().optional(),
  userId: z.uuid(),
});

export type GetUniqueCartItemRequest = z.infer<
  typeof GetUniqueCartItemRequestSchema
>;
export type AddCartItemRequest = z.infer<typeof AddCartItemRequestSchema>;
export type GetManyCartItemsRequest = z.infer<
  typeof GetManyCartItemsRequestSchema
>;
export type UpdateCartItemRequest = z.infer<typeof UpdateCartItemRequestSchema>;
export type DeleteCartItemRequest = z.infer<typeof DeleteCartItemRequestSchema>;
export type ValidateCartItemsRequest = z.infer<
  typeof ValidateCartItemsRequestSchema
>;
