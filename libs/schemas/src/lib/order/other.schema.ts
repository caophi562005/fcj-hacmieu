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
});

export const TimelineSchema = z.array(
  z.object({
    status: z.string(),
    at: z.any(),
  })
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
export type Timeline = z.infer<typeof TimelineSchema>;
export type Order = z.infer<typeof OrderSchema>;
