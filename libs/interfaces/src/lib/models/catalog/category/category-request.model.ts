import { CategorySchema } from '@common/schemas/product';
import z from 'zod';

export const GetManyCategoriesRequestSchema = z
  .object({
    processId: z.uuid(),
    parentCategoryId: z.uuid(),
  })
  .partial()
  .strict();

export const GetCategoryRequestSchema = CategorySchema.pick({
  id: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const CreateCategoryRequestSchema = CategorySchema.pick({
  name: true,
  logo: true,
  createdById: true,
  parentCategoryId: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateCategoryRequestSchema = CategorySchema.pick({
  name: true,
  logo: true,
  updatedById: true,
  parentCategoryId: true,
})
  .partial()
  .extend({
    id: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export const DeleteCategoryRequestSchema = CategorySchema.pick({
  id: true,
  deletedById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export type GetManyCategoriesRequest = z.infer<
  typeof GetManyCategoriesRequestSchema
>;
export type GetCategoryRequest = z.infer<typeof GetCategoryRequestSchema>;
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;
export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;
export type DeleteCategoryRequest = z.infer<typeof DeleteCategoryRequestSchema>;
