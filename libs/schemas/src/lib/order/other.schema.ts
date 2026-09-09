import {
  OrderPaymentStatusEnums,
  OrderStatusEnums,
} from '@common/constants/order.constant';
import { PaymentMethodEnums } from '@common/constants/payment.constant';
import z from 'zod';
import { BaseSchema } from '../common/base.schema';
import { OrderItemSchema } from './order-item.schema';

export const ReceiverSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  note: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const ShippingLocationSchema = z.object({
  provinceId: z.number().int().positive(),
  districtId: z.number().int().positive(),
  wardId: z.number().int().positive(),
  address: z.string(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const TimelineSchema = z.array(
  z.object({
    status: z.string(),
    at: z.any(),
  }),
);

export const OrderSchema = BaseSchema.extend({
  code: z.string(),
  userId: z.uuid(),
  shopId: z.uuid(),
  status: OrderStatusEnums,

  itemTotal: z.number().min(0).default(0),
  shippingFee: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  grandTotal: z.number().min(0).default(0),

  receiver: ReceiverSchema,

  paymentMethod: PaymentMethodEnums,
  paymentStatus: OrderPaymentStatusEnums,
  paymentId: z.uuid(),

  timeline: TimelineSchema.optional(),

  items: z.array(OrderItemSchema),
});

export type Receiver = z.infer<typeof ReceiverSchema>;
export type ShippingLocation = z.infer<typeof ShippingLocationSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
export type Order = z.infer<typeof OrderSchema>;
