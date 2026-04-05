import { BrandSchema } from '@common/schemas/product';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const BrandResponseSchema = BrandSchema;

export const GetBrandResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  logo: z.url(),
  productCount: z.number(),
  soldCount: z.number(),
  categoryIds: z.array(z.uuid()),
  categories: z.any(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const GetManyBrandsResponseSchema = PaginationQueryResponseSchema.extend(
  {
    brands: z.array(GetBrandResponseSchema),
  }
);

export type GetManyBrandsResponse = z.infer<typeof GetManyBrandsResponseSchema>;
export type BrandResponse = z.infer<typeof BrandResponseSchema>;
export type GetBrandResponse = z.infer<typeof GetBrandResponseSchema>;
