import { ProductStatusEnums } from '@common/constants/product.constant';
import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';
import { CategorySchema } from './category.schema';
import { VariantsProductSchema } from './other.schema';

export const ProductSchema = BaseSchema.extend({
  name: z.string(),
  description: z.string(),

  provinceId: z.number().int(),
  provinceName: z.string(),

  districtId: z.number().int(),
  districtName: z.string(),

  wardId: z.number().int(),
  wardName: z.string(),

  sizeGuide: z.string().optional(),
  basePrice: z.number().default(0),
  virtualPrice: z.number().default(0),
  status: ProductStatusEnums,
  brandId: z.uuid().optional(),
  images: z.array(z.string()),
  variants: VariantsProductSchema,
  reviewIds: z.array(z.string()),
  shopId: z.string(),
  likeCount: z.number().int().default(0),
  ratingCount: z.number().int().default(0),
  ratingSum: z.number().int().default(0),
  averageRate: z.number().default(0),
  attributes: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
  soldCount: z.number().int().default(0),
  viewCount: z.number().int().default(0),
  isApproved: z.boolean().default(false),
  isHidden: z.boolean().default(false),
});

export const ProductViewSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().optional(),

  provinceId: z.number().int(),
  provinceName: z.string(),

  districtId: z.number().int(),
  districtName: z.string(),

  wardId: z.number().int(),
  wardName: z.string(),

  brandId: z.uuid().optional(),
  brandName: z.string().optional(),
  brandLogo: z.string().optional(),

  categoryIds: z.array(z.uuid()),
  categories: z.array(
    CategorySchema.pick({
      id: true,
      name: true,
      logo: true,
      parentCategoryId: true,
    })
  ),

  basePrice: z.number().default(0),
  virtualPrice: z.number().default(0),
  minPrice: z.number().default(0),
  maxPrice: z.number().default(0),

  totalStock: z.number().int().default(0),
  isAvailable: z.boolean().default(true),

  images: z.array(z.string()),
  sizeGuide: z.string().optional(),

  variants: VariantsProductSchema,
  attributes: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
  skus: z.array(
    z.object({
      id: z.uuid(),
      value: z.string(),
      price: z.number(),
      stock: z.number().int(),
      image: z.string().optional(),
    })
  ),

  reviewIds: z.array(z.uuid()),
  ratingCount: z.number().int().default(0),
  averageRate: z.number().default(0),
  soldCount: z.number().int().default(0),
  viewCount: z.number().int().default(0),
  likeCount: z.number().int().default(0),

  shopId: z.uuid(),
  status: ProductStatusEnums,
  isApproved: z.boolean().default(false),
  isHidden: z.boolean().default(false),

  createdAt: z.any(),
  updatedAt: z.any(),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductView = z.infer<typeof ProductViewSchema>;
