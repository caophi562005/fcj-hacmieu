import { PaymentSchema } from '@common/schemas/payment';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const PaymentResponseSchema = PaymentSchema;

export const GetPaymentResponseSchema = PaymentSchema.extend({
  qrCode: z.string().optional(),
});

export const GetManyPaymentsResponseSchema =
  PaginationQueryResponseSchema.extend({
    payments: z.array(PaymentSchema),
  });

export const DashboardPaymentResponseSchema = z.object({
  totalAmount: z.number(),
});

export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
export type GetPaymentResponse = z.infer<typeof GetPaymentResponseSchema>;
export type GetManyPaymentsResponse = z.infer<
  typeof GetManyPaymentsResponseSchema
>;
export type DashboardPaymentResponse = z.infer<
  typeof DashboardPaymentResponseSchema
>;
