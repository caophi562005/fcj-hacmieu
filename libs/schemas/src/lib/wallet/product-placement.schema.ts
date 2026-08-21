import z from 'zod';
import { ProductPlacementStatusEnums } from '@common/constants/product-placement.constant';

export const ProductPlacementSchema = z.object({
  id: z.uuid(),
  shopId: z.uuid(),
  productId: z.uuid(),
  position: z.number().int().positive(),
  amount: z.number().int().nonnegative(),
  durationDays: z.number().int().positive(),
  startsAt: z.any(),
  endsAt: z.any(),
  status: ProductPlacementStatusEnums,
  cancelledAt: z.any().nullable(),
  cancelledBy: z.string().nullable(),
  cancelReason: z.string().nullable(),
  createdAt: z.any(),
  updatedAt: z.any(),
});
