import z from 'zod';

export const NotificationTypeValues = {
  ORDER_UPDATE: 'ORDER_UPDATE',
  PROMOTION: 'PROMOTION',
  WALLET_UPDATE: 'WALLET_UPDATE',
  TRUST_ME_BRO_UPDATE: 'TRUST_ME_BRO_UPDATE',
} as const;

export const NotificationTypeEnums = z.enum([
  NotificationTypeValues.ORDER_UPDATE,
  NotificationTypeValues.PROMOTION,
  NotificationTypeValues.WALLET_UPDATE,
  NotificationTypeValues.TRUST_ME_BRO_UPDATE,
]);
