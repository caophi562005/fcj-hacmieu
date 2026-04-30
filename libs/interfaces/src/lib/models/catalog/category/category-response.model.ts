import { CategorySchema } from '@common/schemas/catalog';
import z from 'zod';

export const CategoryResponseSchema = CategorySchema.extend({
  parentCategory: z
    .object({
      id: z.uuid(),
      name: z.string(),
    })
    .nullable(),
});

export const GetCategoryResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  logo: z.url(),
  parentCategory: z
    .object({
      id: z.uuid(),
      name: z.string(),
    })
    .optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const GetManyCategoriesResponseSchema = z.object({
  totalItems: z.number(),
  categories: z.array(GetCategoryResponseSchema),
});

export type GetManyCategoriesResponse = z.infer<
  typeof GetManyCategoriesResponseSchema
>;
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
export type GetCategoryResponse = z.infer<typeof GetCategoryResponseSchema>;
