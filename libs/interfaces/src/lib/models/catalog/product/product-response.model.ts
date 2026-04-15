import {
  BrandSchema,
  CategorySchema,
  ProductSchema,
  ProductViewSchema,
  SKUSchema,
} from '@common/schemas/product';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const GetManyProductsResponseSchema =
  PaginationQueryResponseSchema.extend({
    products: z.array(
      ProductViewSchema.pick({
        id: true,
        name: true,
        basePrice: true,
        virtualPrice: true,
        images: true,
        status: true,
        averageRate: true,
        soldCount: true,
        ratingCount: true,
      }),
    ),
  });

export const ProductResponseSchema = ProductSchema.extend({
  skus: z.array(
    SKUSchema.pick({
      id: true,
      value: true,
      price: true,
      stock: true,
      image: true,
    }),
  ),
  brand: BrandSchema.pick({
    id: true,
    name: true,
    logo: true,
  }),
  categories: z.array(
    CategorySchema.pick({
      id: true,
      name: true,
      logo: true,
      parentCategoryId: true,
    }),
  ),
});

export const GetProductResponseSchema = ProductResponseSchema;

export const ValidateItemResultSchema = z.object({
  productId: z.string(),
  skuId: z.string(),
  isValid: z.boolean(),
  cartItemId: z.uuid(),
  quantity: z.number(),
  price: z.number(), // Giá hiện tại để snapshot
  productName: z.string(),
  productImage: z.url(),
  skuValue: z.string(),
  shopId: z.string(), // Để check lại shop sở hữu
  error: z.string().optional(), // Lý do lỗi: "OUT_OF_STOCK", "PRODUCT_INACTIVE"...
});

export const ValidateProductsResponseSchema = z.object({
  isValid: z.boolean(),
  items: z.array(ValidateItemResultSchema),
});

export type GetManyProductsResponse = z.infer<
  typeof GetManyProductsResponseSchema
>;
export type GetProductResponse = z.infer<typeof GetProductResponseSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type ValidateItemResult = z.infer<typeof ValidateItemResultSchema>;
export type ValidateProductsResponse = z.infer<
  typeof ValidateProductsResponseSchema
>;
