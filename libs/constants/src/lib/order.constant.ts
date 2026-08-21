import { z } from 'zod';

export const OrderStatusValues = {
  CREATING: 'CREATING', // đang tạo đơn
  PENDING: 'PENDING', // chờ xác nhận
  CONFIRMED: 'CONFIRMED', // đã xác nhận, đang chuẩn bị
  SHIPPING: 'SHIPPING', // đang giao
  COMPLETED: 'COMPLETED', // đã giao
  CANCELLED: 'CANCELLED', // đã hủy
  REFUNDED: 'REFUNDED', // đã hoàn tiền
} as const;

export const OrderStatusEnums = z.enum([
  OrderStatusValues.CREATING,
  OrderStatusValues.PENDING,
  OrderStatusValues.CONFIRMED,
  OrderStatusValues.SHIPPING,
  OrderStatusValues.COMPLETED,
  OrderStatusValues.CANCELLED,
  OrderStatusValues.REFUNDED,
]);

export const OrderPaymentStatusValues = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const OrderPaymentStatusEnums = z.enum([
  OrderPaymentStatusValues.PENDING,
  OrderPaymentStatusValues.SUCCESS,
  OrderPaymentStatusValues.FAILED,
  OrderPaymentStatusValues.REFUNDED,
]);

export type OrderStatus = z.infer<typeof OrderStatusEnums>;

export const ShippingMethodValues = {
  FAST: 'fast',
  STANDARD: 'std',
} as const;

export const ShippingMethodEnums = z.enum([
  ShippingMethodValues.FAST,
  ShippingMethodValues.STANDARD,
]);

// The client sends only this method identifier. These authoritative prices
// are applied by order-service and are never accepted from the browser.
export const ShippingMethodFees = {
  [ShippingMethodValues.FAST]: 25_000,
  [ShippingMethodValues.STANDARD]: 0,
} as const;

export type ShippingMethod = z.infer<typeof ShippingMethodEnums>;
