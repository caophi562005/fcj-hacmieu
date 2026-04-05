import z from 'zod';

export const MessageTypeValues = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  PRODUCT_CARD: 'PRODUCT_CARD',
  ORDER_CARD: 'ORDER_CARD',
  STICKER: 'STICKER',
} as const;

export const MessageTypeEnums = z.enum([
  MessageTypeValues.TEXT,
  MessageTypeValues.IMAGE,
  MessageTypeValues.VIDEO,
  MessageTypeValues.PRODUCT_CARD,
  MessageTypeValues.ORDER_CARD,
  MessageTypeValues.STICKER,
]);
