import { AddressSchema } from '@common/schemas/user-access';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../common/pagination.model';

export const GetManyAddressesRequestSchema =
  PaginationQueryRequestSchema.extend({
    userId: z.uuid(),
    processId: z.uuid().optional(),
  }).strict();

export const GetAddressRequestSchema = AddressSchema.pick({
  id: true,
  userId: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const CreateAddressRequestSchema = AddressSchema.pick({
  userId: true,
  name: true,
  address: true,
  ward: true,
  district: true,
  province: true,
  isDefault: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateAddressRequestSchema = CreateAddressRequestSchema.partial()
  .safeExtend({
    id: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export const DeleteAddressRequestSchema = AddressSchema.pick({
  id: true,
  userId: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export type GetManyAddressesRequest = z.infer<
  typeof GetManyAddressesRequestSchema
>;
export type GetAddressRequest = z.infer<typeof GetAddressRequestSchema>;
export type CreateAddressRequest = z.infer<typeof CreateAddressRequestSchema>;
export type UpdateAddressRequest = z.infer<typeof UpdateAddressRequestSchema>;
export type DeleteAddressRequest = z.infer<typeof DeleteAddressRequestSchema>;
