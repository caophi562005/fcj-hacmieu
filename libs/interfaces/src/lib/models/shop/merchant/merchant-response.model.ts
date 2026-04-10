import { MerchantSchema } from '@common/schemas/shop';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const MerchantResponseSchema = MerchantSchema;

export const GetManyMerchantsResponseSchema =
  PaginationQueryResponseSchema.extend({
    merchants: z.array(MerchantResponseSchema),
  });

export type MerchantResponse = z.infer<typeof MerchantResponseSchema>;
export type GetManyMerchantsResponse = z.infer<
  typeof GetManyMerchantsResponseSchema
>;
