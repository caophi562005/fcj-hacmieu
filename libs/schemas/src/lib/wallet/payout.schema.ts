import { PayoutStatusEnums } from '@common/constants/payout.constant';
import z from 'zod';

export const PayoutRequestSchema = z.object({
  id: z.uuid(),
  creditId: z.uuid(),
  shopId: z.uuid(),
  amount: z.number().int().positive(),
  bankName: z.string(),
  accountNumber: z.string(),
  accountHolder: z.string(),
  note: z.string().nullable(),
  status: PayoutStatusEnums,
  rejectReason: z.string().nullable(),
  processedAt: z.any().nullable(),
  createdAt: z.any(),
  updatedAt: z.any(),
});
