import z from 'zod';
import { PRODUCT_PLACEMENT_ALLOWED_DURATIONS } from '@common/constants/product-placement.constant';

export const CreateProductPlacementRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid(),
    productId: z.uuid(),
    durationDays: z.coerce
      .number()
      .int()
      .refine(
        (value) =>
          PRODUCT_PLACEMENT_ALLOWED_DURATIONS.includes(
            value as (typeof PRODUCT_PLACEMENT_ALLOWED_DURATIONS)[number],
          ),
        { message: 'durationDays must be 1, 3, or 7' },
      ),
    idempotencyKey: z.uuid(),
  })
  .strict();

export const GetProductPlacementsRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['ACTIVE', 'CANCELLED', 'EXPIRED']).optional(),
  })
  .strict();

export const CancelProductPlacementRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    placementId: z.uuid(),
    actorId: z.string().trim().min(1).max(255),
    reason: z.string().trim().min(3).max(1000),
  })
  .strict();

export type CreateProductPlacementRequest = z.infer<
  typeof CreateProductPlacementRequestSchema
>;
export type GetProductPlacementsRequest = z.infer<
  typeof GetProductPlacementsRequestSchema
>;
export type CancelProductPlacementRequest = z.infer<
  typeof CancelProductPlacementRequestSchema
>;
