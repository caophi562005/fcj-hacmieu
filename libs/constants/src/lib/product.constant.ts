import { z } from 'zod';

export const ProductStatusValues = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
  DRAFT: 'DRAFT',
} as const;

export const ProductStatusEnums = z.enum([
  ProductStatusValues.ACTIVE,
  ProductStatusValues.INACTIVE,
  ProductStatusValues.BANNED,
  ProductStatusValues.DRAFT,
]);

export const OrderByValues = {
  Asc: 'asc',
  Desc: 'desc',
} as const;

export const OrderByEnums = z
  .enum([OrderByValues.Asc, OrderByValues.Desc])
  .default(OrderByValues.Desc);

export const SortByValues = {
  Price: 'price',
  CreatedAt: 'createdAt',
  Sale: 'sale',
} as const;

export const SortByEnums = z
  .enum([SortByValues.Price, SortByValues.CreatedAt, SortByValues.Sale])
  .default(SortByValues.CreatedAt);

export type OrderBy = z.infer<typeof OrderByEnums>;
export type SortBy = z.infer<typeof SortByEnums>;
export type ProductStatus = z.infer<typeof ProductStatusEnums>;
