import z from 'zod';

export const NotificationTypeValues = {
  ORDER_UPDATE: 'ORDER_UPDATE',
  PROMOTION: 'PROMOTION',
  WALLET_UPDATE: 'WALLET_UPDATE',
  OTHER: 'OTHER',
} as const;

export const NotificationTypeEnums = z.enum([
  NotificationTypeValues.ORDER_UPDATE,
  NotificationTypeValues.PROMOTION,
  NotificationTypeValues.WALLET_UPDATE,
  NotificationTypeValues.OTHER,
]);
