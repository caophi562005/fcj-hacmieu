import { ShopSchema, ShopStatusEnums } from '@common/schemas/shop';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../../common/pagination.model';

export const GetManyShopsRequestSchema = PaginationQueryRequestSchema.extend({
  merchantId: z.uuid().optional(),
  name: z.string().optional(),
  status: ShopStatusEnums.optional(),
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const GetShopRequestSchema = ShopSchema.pick({
  id: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const CreateShopRequestSchema = ShopSchema.pick({
  merchantId: true,
  name: true,
  description: true,
  logo: true,
  banner: true,
  phone: true,
  status: true,
  pickupAddress: true,
  returnAddress: true,
  createdById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateShopRequestSchema = ShopSchema.pick({
  merchantId: true,
  name: true,
  description: true,
  logo: true,
  banner: true,
  phone: true,
  status: true,
  pickupAddress: true,
  returnAddress: true,
  updatedById: true,
})
  .partial()
  .extend({
    id: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export const DeleteShopRequestSchema = ShopSchema.pick({
  id: true,
  deletedById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export type GetManyShopsRequest = z.infer<typeof GetManyShopsRequestSchema>;
export type GetShopRequest = z.infer<typeof GetShopRequestSchema>;
export type CreateShopRequest = z.infer<typeof CreateShopRequestSchema>;
export type UpdateShopRequest = z.infer<typeof UpdateShopRequestSchema>;
export type DeleteShopRequest = z.infer<typeof DeleteShopRequestSchema>;
