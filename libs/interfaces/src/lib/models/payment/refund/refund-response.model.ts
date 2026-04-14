import { RefundSchema } from '@common/schemas/payment';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const RefundResponseSchema = RefundSchema;

export const GetManyRefundsResponseSchema =
  PaginationQueryResponseSchema.extend({
    refunds: z.array(RefundSchema),
  });

export type RefundResponse = z.infer<typeof RefundResponseSchema>;
export type GetManyRefundsResponse = z.infer<
  typeof GetManyRefundsResponseSchema
>;
