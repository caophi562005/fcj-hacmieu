import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateMerchantRequestSchema,
  DeleteMerchantRequestSchema,
  GetManyMerchantsRequestSchema,
  GetManyMerchantsResponseSchema,
  GetMerchantRequestSchema,
  MerchantResponseSchema,
  UpdateMerchantRequestSchema,
} from '@common/interfaces/models/shop';
import { createZodDto } from 'nestjs-zod';

export class GetManyMerchantsRequestDto extends createZodDto(
  GetManyMerchantsRequestSchema.omit({
    processId: true,
  }),
) {}

export class GetMerchantRequestDto extends createZodDto(
  GetMerchantRequestSchema.omit({
    processId: true,
  }),
) {}

export class CreateMerchantRequestDto extends createZodDto(
  CreateMerchantRequestSchema.omit({ processId: true, createdById: true }),
) {}

export class UpdateMerchantRequestDto extends createZodDto(
  UpdateMerchantRequestSchema.omit({ processId: true, updatedById: true }),
) {}

export class DeleteMerchantRequestDto extends createZodDto(
  DeleteMerchantRequestSchema.omit({ processId: true, deletedById: true }),
) {}

// ====================================================================================================

export class GetManyMerchantsResponseDto extends createZodDto(
  ResponseSchema(GetManyMerchantsResponseSchema),
) {}

export class GetMerchantResponseDto extends createZodDto(
  ResponseSchema(MerchantResponseSchema),
) {}
