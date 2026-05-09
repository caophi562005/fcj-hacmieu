import { PayoutStatusEnums } from '@common/constants/payout.constant';
import z from 'zod';

export const CreateShopPayoutRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid(),
    amount: z.number().int().positive(),
    bankName: z.string().trim().min(1).max(255),
    accountNumber: z.string().trim().min(4).max(50),
    accountHolder: z.string().trim().min(1).max(255),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export const GetShopPayoutByIdRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid(),
    payoutId: z.uuid(),
  })
  .strict();

export const GetShopPayoutsRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: PayoutStatusEnums.optional(),
  })
  .strict();

export const UpdateShopPayoutStatusRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid(),
    payoutId: z.uuid(),
    status: PayoutStatusEnums,
    rejectReason: z.string().trim().max(500).optional(),
  })
  .strict();

export const DeleteShopPayoutRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid(),
    payoutId: z.uuid(),
  })
  .strict();

export type CreateShopPayoutRequest = z.infer<
  typeof CreateShopPayoutRequestSchema
>;
export type GetShopPayoutByIdRequest = z.infer<
  typeof GetShopPayoutByIdRequestSchema
>;
export type GetShopPayoutsRequest = z.infer<typeof GetShopPayoutsRequestSchema>;
export type UpdateShopPayoutStatusRequest = z.infer<
  typeof UpdateShopPayoutStatusRequestSchema
>;
export type DeleteShopPayoutRequest = z.infer<
  typeof DeleteShopPayoutRequestSchema
>;
