import { AddressSchema } from '@common/schemas/iam/address.schema';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const AddressResponseSchema = AddressSchema;

export const GetManyAddressesResponseSchema =
  PaginationQueryResponseSchema.extend({
    addresses: z.array(AddressSchema),
  });

export type AddressResponse = z.infer<typeof AddressResponseSchema>;
export type GetManyAddressesResponse = z.infer<
  typeof GetManyAddressesResponseSchema
>;
