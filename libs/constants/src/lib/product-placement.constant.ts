import z from 'zod';

export const ProductPlacementStatusValues = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export const ProductPlacementStatusEnums = z.enum([
  ProductPlacementStatusValues.ACTIVE,
  ProductPlacementStatusValues.CANCELLED,
  ProductPlacementStatusValues.EXPIRED,
]);

export const PRODUCT_PLACEMENT_ALLOWED_DURATIONS = [1, 3, 7] as const;
