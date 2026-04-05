import { AttributeSchema } from '@common/schemas/product';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../../common/pagination.model';

export const GetManyAttributesRequestSchema =
  PaginationQueryRequestSchema.extend({
    name: z.string().optional(),
  });

export const GetAttributeRequestSchema = AttributeSchema.pick({
  id: true,
});

export const CreateAttributeRequestSchema = AttributeSchema.pick({
  name: true,
  url: true,
  createdById: true,
}).extend({
  processId: z.string().optional(),
});

export const UpdateAttributeRequestSchema = AttributeSchema.pick({
  id: true,
  name: true,
  url: true,
  updatedById: true,
}).extend({
  processId: z.string().optional(),
});

export const DeleteAttributeRequestSchema = AttributeSchema.pick({
  id: true,
  deletedById: true,
}).extend({
  processId: z.string().optional(),
});

export type GetManyAttributesRequest = z.infer<
  typeof GetManyAttributesRequestSchema
>;
export type GetAttributeRequest = z.infer<typeof GetAttributeRequestSchema>;
export type CreateAttributeRequest = z.infer<
  typeof CreateAttributeRequestSchema
>;
export type UpdateAttributeRequest = z.infer<
  typeof UpdateAttributeRequestSchema
>;
export type DeleteAttributeRequest = z.infer<
  typeof DeleteAttributeRequestSchema
>;
