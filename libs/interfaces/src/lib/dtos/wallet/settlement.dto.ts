import { ResponseSchema } from '../../models/common/response.model';
import {
  GetSellerSettlementByIdRequestSchema,
  GetSellerSettlementSummaryRequestSchema,
  GetSellerSettlementSummaryResponseSchema,
  GetSellerSettlementsRequestBaseSchema,
  GetSellerSettlementsResponseSchema,
  SellerSettlementDetailResponseSchema,
  UpdateSellerSettlementStatusRequestBaseSchema,
} from '../../models/wallet';
import { SellerSettlementActionValues } from '@common/constants/settlement.constant';
import { createZodDto } from 'nestjs-zod';

export class GetSellerSettlementSummaryRequestDto extends createZodDto(
  GetSellerSettlementSummaryRequestSchema.omit({ processId: true }),
) {}

export class GetSellerSettlementsRequestDto extends createZodDto(
  GetSellerSettlementsRequestBaseSchema.omit({ processId: true }).refine(
    (data) =>
      data.minAmount === undefined ||
      data.maxAmount === undefined ||
      data.minAmount <= data.maxAmount,
    { message: 'minAmount must be less than or equal to maxAmount' },
  ),
) {}

export class GetSellerSettlementByIdRequestDto extends createZodDto(
  GetSellerSettlementByIdRequestSchema.omit({ processId: true, shopId: true }),
) {}

export class UpdateSellerSettlementStatusRequestDto extends createZodDto(
  UpdateSellerSettlementStatusRequestBaseSchema.omit({
    processId: true,
    settlementId: true,
    actorId: true,
  }).superRefine((data, ctx) => {
    if (
      (data.action === SellerSettlementActionValues.HOLD ||
        data.action === SellerSettlementActionValues.CANCEL) &&
      !data.reason
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['reason'],
        message: 'A reason is required for HOLD and CANCEL actions',
      });
    }
  }),
) {}

export class SellerSettlementDetailResponseDto extends createZodDto(
  ResponseSchema(SellerSettlementDetailResponseSchema),
) {}

export class GetSellerSettlementsResponseDto extends createZodDto(
  ResponseSchema(GetSellerSettlementsResponseSchema),
) {}

export class GetSellerSettlementSummaryResponseDto extends createZodDto(
  ResponseSchema(GetSellerSettlementSummaryResponseSchema),
) {}
