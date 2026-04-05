import {
  PaymentMethodEnums,
  PaymentStatusEnums,
} from '@common/constants/payment.constant';
import z from 'zod';
import { BaseSchema } from '../common/base.schema';

export const PaymentSchema = BaseSchema.extend({
  code: z.string(),
  userId: z.uuid(),
  orderId: z.array(z.uuid()),
  method: PaymentMethodEnums,
  status: PaymentStatusEnums,
  amount: z.number(),
});
