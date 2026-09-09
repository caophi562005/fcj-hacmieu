import { ShopSchema } from '@common/schemas/shop';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const ShopResponseSchema = ShopSchema;

export const PublicShopResponseSchema = ShopSchema.pick({
  id: true,
  userId: true,
  name: true,
  description: true,
  logo: true,
  banner: true,
  phone: true,
  pickupAddress: true,
  pickupProvinceId: true,
  pickupDistrictId: true,
  pickupWardId: true,
  pickupLatitude: true,
  pickupLongitude: true,
  createdAt: true,
});

export const GetManyShopsResponseSchema = PaginationQueryResponseSchema.extend({
  shops: z.array(ShopResponseSchema),
});

export const GetManyPublicShopsResponseSchema =
  PaginationQueryResponseSchema.extend({
    shops: z.array(PublicShopResponseSchema),
  });

export type ShopResponse = z.infer<typeof ShopResponseSchema>;
export type PublicShopResponse = z.infer<typeof PublicShopResponseSchema>;
export type GetManyShopsResponse = z.infer<typeof GetManyShopsResponseSchema>;
export type GetManyPublicShopsResponse = z.infer<
  typeof GetManyPublicShopsResponseSchema
>;
