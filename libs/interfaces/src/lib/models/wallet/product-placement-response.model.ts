import z from 'zod';
import { ProductPlacementSchema } from '@common/schemas/wallet/product-placement.schema';

export const ProductPlacementResponseSchema = ProductPlacementSchema;

export const ProductPlacementConfigResponseSchema = z.object({
  maxActiveSlots: z.number().int().positive(),
  occupiedSlots: z.number().int().nonnegative(),
  availableSlots: z.number().int().nonnegative(),
  pricePerDay: z.number().int().positive(),
  allowedDurations: z.array(z.number().int().positive()),
});

export const GetProductPlacementsResponseSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  placements: z.array(ProductPlacementResponseSchema),
});

export type ProductPlacementResponse = z.infer<
  typeof ProductPlacementResponseSchema
>;
export type ProductPlacementConfigResponse = z.infer<
  typeof ProductPlacementConfigResponseSchema
>;
export type GetProductPlacementsResponse = z.infer<
  typeof GetProductPlacementsResponseSchema
>;
