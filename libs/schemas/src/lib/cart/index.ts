import z from 'zod';

export const CartItemSchema = z.object({
  id: z.uuid(),
  cartId: z.uuid(),
  productId: z.uuid(),
  skuId: z.uuid(),
  shopId: z.uuid(),
  quantity: z.number().min(1).default(1),
  productName: z.string(),
  skuValue: z.string(),
  productImage: z.string().nullable(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const CartShopGroupSchema = z.object({
  shopId: z.string(),
  cartItems: z.array(CartItemSchema),
});

export type CartShopGroup = z.infer<typeof CartShopGroupSchema>;
