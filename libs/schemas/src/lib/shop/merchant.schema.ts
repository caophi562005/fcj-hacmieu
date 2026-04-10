import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';

export const MerchantTypeEnums = z.enum(['INDIVIDUAL', 'BUSINESS']);

export const MerchantApprovalStatusEnums = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
]);

export const MerchantSchema = BaseSchema.extend({
  userId: z.uuid(),
  type: MerchantTypeEnums,
  legalName: z.string().max(500),
  taxCode: z.string().max(100).nullable(),
  approvalStatus: MerchantApprovalStatusEnums,
  canSell: z.boolean(),
});

export type Merchant = z.infer<typeof MerchantSchema>;
