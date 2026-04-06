import { CartItemSchema } from '@common/schemas/cart';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const CartItemResponseSchema = CartItemSchema;

export const AddCartItemResponseSchema = z.object({
  cartItem: CartItemResponseSchema,
  cartCount: z.number().int(),
});

export const GetManyCartItemsResponseSchema =
  PaginationQueryResponseSchema.extend({
    cartItems: z.array(
      z.object({
        shopId: z.uuid(),
        cartItems: z.array(CartItemResponseSchema),
      })
    ),
  });

export const DeleteCartItemResponseSchema = z.object({
  cartCount: z.number().int(),
});

export type CartItemResponse = z.infer<typeof CartItemResponseSchema>;
export type AddCartItemResponse = z.infer<typeof AddCartItemResponseSchema>;
export type DeleteCartItemResponse = z.infer<
  typeof DeleteCartItemResponseSchema
>;
export type GetManyCartItemsResponse = z.infer<
  typeof GetManyCartItemsResponseSchema
>;
