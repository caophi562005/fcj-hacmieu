import { RefundStatusEnums } from '@common/constants/payment.constant';
import z from 'zod';
import { BaseSchema } from '../common/base.schema';

export const RefundSchema = BaseSchema.extend({
  userId: z.uuid(),
  orderId: z.uuid(),
  amount: z.number(),
  status: RefundStatusEnums,
  reason: z.string().optional(),
});
