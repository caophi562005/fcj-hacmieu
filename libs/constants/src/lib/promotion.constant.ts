import z from 'zod';

export const PromotionStatusValues = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED',
} as const;

export const PromotionStatusEnums = z.enum([
  PromotionStatusValues.DRAFT,
  PromotionStatusValues.ACTIVE,
  PromotionStatusValues.PAUSED,
  PromotionStatusValues.ENDED,
]);

export const DiscountTypeValues = {
  PERCENT: 'PERCENT',
  AMOUNT: 'AMOUNT',
} as const;

export const DiscountTypeEnums = z.enum([
  DiscountTypeValues.PERCENT,
  DiscountTypeValues.AMOUNT,
]);

export const PromotionScopeValues = {
  ORDER: 'ORDER',
  SHIPPING: 'SHIPPING',
} as const;

export const PromotionScopeEnums = z.enum([
  PromotionScopeValues.ORDER,
  PromotionScopeValues.SHIPPING,
]);
