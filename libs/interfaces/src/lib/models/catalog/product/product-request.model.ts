import {
  OrderByEnums,
  ProductStatusEnums,
  SortByEnums,
} from '@common/constants/product.constant';
import {
  AttributesProductSchema,
  ProductSchema,
  SKUSchema,
} from '@common/schemas/product';
import { generateSKUs } from '@common/utils/generate-skus.util';
import z from 'zod';

export const GetManyProductsRequestSchema = z
  .object({
    name: z.string(),
    status: ProductStatusEnums,

    brandIds: z.preprocess((value) => {
      if (typeof value === 'string') {
        return value;
      }
      return value;
    }, z.array(z.uuid())),
    categories: z.preprocess((value) => {
      if (typeof value === 'string') {
        return value;
      }
      return value;
    }, z.array(z.uuid())),

    minPrice: z.coerce.number().int().positive(),
    maxPrice: z.coerce.number().int().positive(),
    shopId: z.uuid(),
    provinceId: z.number().int(),
    isApproved: z.coerce.boolean(),
  })
  .partial()
  .extend({
    orderBy: OrderByEnums,
    sortBy: SortByEnums,

    processId: z.uuid().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  });

export const GetProductRequestSchema = z.object({
  id: z.uuid(),
  isHidden: z.boolean().optional(),
  processId: z.uuid().optional(),
  shopId: z.uuid().optional(),
});

export const UpsertSKUBodySchema = SKUSchema.pick({
  value: true,
  price: true,
  stock: true,
  image: true,
}).strict();

export const CreateProductRequestSchema = ProductSchema.pick({
  name: true,
  basePrice: true,
  virtualPrice: true,
  brandId: true,
  images: true,
  variants: true,
  createdById: true,
  updatedById: true,
  shopId: true,
  description: true,
  sizeGuide: true,
  provinceId: true,
  provinceName: true,
  districtId: true,
  districtName: true,
  wardId: true,
  wardName: true,
  status: true,
})
  .extend({
    categories: z.array(z.uuid()),
    skus: z.array(UpsertSKUBodySchema),
    attributes: AttributesProductSchema,
    processId: z.uuid().optional(),
  })
  .strict()
  .superRefine(({ variants, skus }, ctx) => {
    //Kiểm tra xem số lượng SKU có hợp lệ không
    const skuValueArray = generateSKUs(variants);
    if (skus.length !== skuValueArray.length) {
      return ctx.addIssue({
        code: 'custom',
        message: `Số lượng SKU không hợp lệ`,
        path: ['skus'],
      });
    }

    // Kiểm tra từng SKU có hợp lệ không
    let wrongSKUIndex = -1;
    const isValidSKUs = skus.every((sku, index) => {
      const isValid = sku.value === skuValueArray[index].value;
      if (!isValid) {
        wrongSKUIndex = index;
      }
      return isValid;
    });
    if (!isValidSKUs) {
      ctx.addIssue({
        code: 'custom',
        message: `Giá trị SKU index ${wrongSKUIndex} không hợp lệ`,
        path: ['skus'],
      });
    }
  });

export const UpdateProductRequestSchema = CreateProductRequestSchema.safeExtend(
  {
    id: z.uuid(),
    soldCount: z.number().optional(),
    isApproved: z.boolean().optional(),
  }
).strict();

export const DeleteProductRequestSchema = ProductSchema.pick({
  id: true,
  deletedById: true,
  shopId: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const ValidateProductsRequestSchema = z.object({
  productIds: z.array(
    z.object({
      productId: z.uuid(),
      skuId: z.uuid(),
      quantity: z.number(),
      cartItemId: z.uuid(),
    })
  ),
  processId: z.uuid().optional(),
});

export type GetManyProductsRequest = z.infer<
  typeof GetManyProductsRequestSchema
>;
export type GetProductRequest = z.infer<typeof GetProductRequestSchema>;
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;
export type ValidateProductsRequest = z.infer<
  typeof ValidateProductsRequestSchema
>;
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;
export type DeleteProductRequest = z.infer<typeof DeleteProductRequestSchema>;
