import { RefundSchema } from '@common/schemas/payment';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../../common/pagination.model';

export const GetManyRefundsRequestSchema = RefundSchema.pick({
  userId: true,
  orderId: true,
  status: true,
})
  .partial()
  .extend({
    processId: z.uuid().optional(),
    page: PaginationQueryRequestSchema.shape.page,
    limit: PaginationQueryRequestSchema.shape.limit,
  })
  .strict();

export const GetRefundRequestSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid().optional(),
    processId: z.uuid().optional(),
  })
  .strict();

export const CreateRefundRequestSchema = RefundSchema.pick({
  userId: true,
  orderId: true,
  amount: true,
  reason: true,
})
  .extend({
    createdById: z.uuid().optional(),
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateRefundStatusRequestSchema = RefundSchema.pick({
  id: true,
  status: true,
})
  .extend({
    updatedById: z.uuid().optional(),
    processId: z.uuid().optional(),
  })
  .strict();

export type GetManyRefundsRequest = z.infer<typeof GetManyRefundsRequestSchema>;
export type GetRefundRequest = z.infer<typeof GetRefundRequestSchema>;
export type CreateRefundRequest = z.infer<typeof CreateRefundRequestSchema>;
export type UpdateRefundStatusRequest = z.infer<
  typeof UpdateRefundStatusRequestSchema
>;
