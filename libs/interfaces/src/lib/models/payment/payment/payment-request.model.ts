import { PaymentSchema } from '@common/schemas/payment';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../../common/pagination.model';

export const GetManyPaymentsRequestSchema = PaymentSchema.pick({
  userId: true,
  method: true,
  status: true,
  amount: true,
  code: true,
  createdAt: true,
})
  .partial()
  .extend({
    processId: z.uuid().optional(),
    page: PaginationQueryRequestSchema.shape.page,
    limit: PaginationQueryRequestSchema.shape.limit,
  })
  .strict();

export const GetPaymentRequestSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export const CreatePaymentRequestSchema = PaymentSchema.pick({
  id: true,
  code: true,
  userId: true,
  orderId: true,
  method: true,
  status: true,
  amount: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const DeletePaymentRequestSchema = PaymentSchema.pick({
  id: true,
  deletedById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdatePaymentStatusRequestSchema = PaymentSchema.pick({
  id: true,
  status: true,
  updatedById: true,
})
  .extend({
    processId: z.string().uuid().optional(),
  })
  .strict();

export type GetManyPaymentsRequest = z.infer<
  typeof GetManyPaymentsRequestSchema
>;
export type GetPaymentRequest = z.infer<typeof GetPaymentRequestSchema>;
export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;
export type DeletePaymentRequest = z.infer<typeof DeletePaymentRequestSchema>;
export type UpdatePaymentStatusRequest = z.infer<
  typeof UpdatePaymentStatusRequestSchema
>;
