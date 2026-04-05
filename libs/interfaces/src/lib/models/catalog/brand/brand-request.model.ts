import { BrandSchema } from '@common/schemas/product';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../../common/pagination.model';

export const GetManyBrandsRequestSchema = PaginationQueryRequestSchema.extend({
  name: BrandSchema.shape.name.optional(),
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const GetBrandRequestSchema = BrandSchema.pick({
  id: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const CreateBrandRequestSchema = BrandSchema.pick({
  name: true,
  logo: true,
  createdById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateBrandRequestSchema = BrandSchema.pick({
  name: true,
  logo: true,
  updatedById: true,
})
  .partial()
  .extend({
    id: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export const DeleteBrandRequestSchema = BrandSchema.pick({
  id: true,
  deletedById: true,
}).strict();

export type GetManyBrandsRequest = z.infer<typeof GetManyBrandsRequestSchema>;
export type GetBrandRequest = z.infer<typeof GetBrandRequestSchema>;
export type CreateBrandRequest = z.infer<typeof CreateBrandRequestSchema>;
export type UpdateBrandRequest = z.infer<typeof UpdateBrandRequestSchema>;
export type DeleteBrandRequest = z.infer<typeof DeleteBrandRequestSchema>;
