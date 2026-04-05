import { ShopSchema } from '@common/schemas/user-access';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../common/pagination.model';

export const GetShopRequestSchema = z
  .object({
    id: z.uuid().optional(),
    userId: z.uuid().optional(),
    processId: z.uuid().optional(),
  })
  .strict();

export const GetManyShopsRequestSchema = PaginationQueryRequestSchema.extend({
  isOpen: z.boolean().optional(),
  processId: z.uuid().optional(),
}).strict();

export const CreateShopRequestSchema = ShopSchema.pick({
  ownerId: true,
  name: true,
  description: true,
  logo: true,
  address: true,
  phone: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateShopRequestSchema = ShopSchema.pick({
  name: true,
  description: true,
  logo: true,
  address: true,
  phone: true,
  isOpen: true,
  rating: true,
})
  .partial()
  .extend({
    id: z.uuid(),
    ownerId: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateShopRatingRequestSchema = z
  .object({
    id: z.uuid(),
    rating: z.number(),
    processId: z.uuid().optional(),
  })
  .strict();

export const ValidateShopsRequestSchema = z.object({
  processId: z.uuid().optional(),
  shopIds: z.array(z.uuid()),
});

export type CreateShopRequest = z.infer<typeof CreateShopRequestSchema>;
export type UpdateShopRequest = z.infer<typeof UpdateShopRequestSchema>;
export type GetShopRequest = z.infer<typeof GetShopRequestSchema>;
export type GetManyShopsRequest = z.infer<typeof GetManyShopsRequestSchema>;
export type UpdateShopRatingRequest = z.infer<
  typeof UpdateShopRatingRequestSchema
>;
export type ValidateShopsRequest = z.infer<typeof ValidateShopsRequestSchema>;
