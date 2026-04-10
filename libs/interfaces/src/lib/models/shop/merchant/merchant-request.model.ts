import {
  MerchantApprovalStatusEnums,
  MerchantSchema,
  MerchantTypeEnums,
} from '@common/schemas/shop';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../../common/pagination.model';

export const GetManyMerchantsRequestSchema =
  PaginationQueryRequestSchema.extend({
    userId: z.uuid().optional(),
    legalName: z.string().optional(),
    type: MerchantTypeEnums.optional(),
    approvalStatus: MerchantApprovalStatusEnums.optional(),
    canSell: z.boolean().optional(),
  })
    .extend({
      processId: z.uuid().optional(),
    })
    .strict();

export const GetMerchantRequestSchema = MerchantSchema.pick({
  id: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const CreateMerchantRequestSchema = MerchantSchema.pick({
  userId: true,
  type: true,
  legalName: true,
  taxCode: true,
  createdById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateMerchantRequestSchema = MerchantSchema.pick({
  userId: true,
  type: true,
  legalName: true,
  taxCode: true,
  approvalStatus: true,
  canSell: true,
  updatedById: true,
})
  .partial()
  .extend({
    id: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export const DeleteMerchantRequestSchema = MerchantSchema.pick({
  id: true,
  deletedById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export type GetManyMerchantsRequest = z.infer<
  typeof GetManyMerchantsRequestSchema
>;
export type GetMerchantRequest = z.infer<typeof GetMerchantRequestSchema>;
export type CreateMerchantRequest = z.infer<typeof CreateMerchantRequestSchema>;
export type UpdateMerchantRequest = z.infer<typeof UpdateMerchantRequestSchema>;
export type DeleteMerchantRequest = z.infer<typeof DeleteMerchantRequestSchema>;
