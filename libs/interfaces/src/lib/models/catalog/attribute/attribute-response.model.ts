import { AttributeSchema } from '@common/schemas/product';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const AttributeResponseSchema = AttributeSchema;

export const GetAttributeResponseSchema = AttributeSchema.pick({
  id: true,
  name: true,
  url: true,
  createdAt: true,
  updatedAt: true,
});

export const GetManyAttributesResponseSchema =
  PaginationQueryResponseSchema.extend({
    attributes: z.array(GetAttributeResponseSchema),
  });

export type GetManyAttributesResponse = z.infer<
  typeof GetManyAttributesResponseSchema
>;
export type AttributeResponse = z.infer<typeof AttributeResponseSchema>;
export type GetAttributeResponse = z.infer<typeof GetAttributeResponseSchema>;
