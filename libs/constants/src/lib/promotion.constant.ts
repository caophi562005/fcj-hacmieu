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

// ====================================================================================================

export const DiscountTypeValues = {
  PERCENT: 'PERCENT',
  AMOUNT: 'AMOUNT',
} as const;

export const DiscountTypeEnums = z.enum([
  DiscountTypeValues.PERCENT,
  DiscountTypeValues.AMOUNT,
]);

// ====================================================================================================

export const PromotionScopeValues = {
  ORDER: 'ORDER',
  SHIPPING: 'SHIPPING',
} as const;

export const PromotionScopeEnums = z.enum([
  PromotionScopeValues.ORDER,
  PromotionScopeValues.SHIPPING,
]);

// ====================================================================================================

export const RedemptionStatusValues = {
  AVAILABLE: 'AVAILABLE',
  USED: 'USED',
  CANCELLED: 'CANCELLED',
} as const;

export const RedemptionStatusEnums = z.enum([
  RedemptionStatusValues.AVAILABLE,
  RedemptionStatusValues.USED,
  RedemptionStatusValues.CANCELLED,
]);

export type RedemptionStatusType = z.infer<typeof RedemptionStatusEnums>;

// ====================================================================================================

export const MarketingCampaignStatusValues = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
} as const;

export const MarketingCampaignStatusEnums = z.enum([
  MarketingCampaignStatusValues.DRAFT,
  MarketingCampaignStatusValues.SCHEDULED,
  MarketingCampaignStatusValues.PROCESSING,
  MarketingCampaignStatusValues.COMPLETED,
  MarketingCampaignStatusValues.CANCELLED,
  MarketingCampaignStatusValues.FAILED,
]);

export const MarketingDeliveryTypeValues = {
  PROMOTION_ANNOUNCEMENT: 'PROMOTION_ANNOUNCEMENT',
  VOUCHER_EXPIRY_REMINDER: 'VOUCHER_EXPIRY_REMINDER',
} as const;

export const MarketingDeliveryTypeEnums = z.enum([
  MarketingDeliveryTypeValues.PROMOTION_ANNOUNCEMENT,
  MarketingDeliveryTypeValues.VOUCHER_EXPIRY_REMINDER,
]);

export const MarketingDeliveryStatusValues = {
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  OPENED: 'OPENED',
  CLICKED: 'CLICKED',
  BOUNCED: 'BOUNCED',
  COMPLAINED: 'COMPLAINED',
  FAILED: 'FAILED',
} as const;

export const MarketingDeliveryStatusEnums = z.enum([
  MarketingDeliveryStatusValues.QUEUED,
  MarketingDeliveryStatusValues.PROCESSING,
  MarketingDeliveryStatusValues.SENT,
  MarketingDeliveryStatusValues.DELIVERED,
  MarketingDeliveryStatusValues.OPENED,
  MarketingDeliveryStatusValues.CLICKED,
  MarketingDeliveryStatusValues.BOUNCED,
  MarketingDeliveryStatusValues.COMPLAINED,
  MarketingDeliveryStatusValues.FAILED,
]);

export type MarketingCampaignStatusType = z.infer<
  typeof MarketingCampaignStatusEnums
>;
export type MarketingDeliveryType = z.infer<
  typeof MarketingDeliveryTypeEnums
>;
export type MarketingDeliveryStatusType = z.infer<
  typeof MarketingDeliveryStatusEnums
>;
