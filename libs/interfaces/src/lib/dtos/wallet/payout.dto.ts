import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateShopPayoutRequestSchema,
  DeleteShopPayoutRequestSchema,
  GetShopPayoutByIdRequestSchema,
  GetShopPayoutsRequestSchema,
  GetShopPayoutsResponseSchema,
  ShopPayoutResponseSchema,
  UpdateShopPayoutStatusRequestSchema,
} from '@common/interfaces/models/wallet';
import { createZodDto } from 'nestjs-zod';

export class CreateShopPayoutRequestDto extends createZodDto(
  CreateShopPayoutRequestSchema.omit({ processId: true, shopId: true }),
) {}

export class GetShopPayoutByIdRequestDto extends createZodDto(
  GetShopPayoutByIdRequestSchema.omit({ processId: true, shopId: true }),
) {}

export class GetShopPayoutsRequestDto extends createZodDto(
  GetShopPayoutsRequestSchema.omit({ processId: true, shopId: true }),
) {}

export class UpdateShopPayoutStatusRequestDto extends createZodDto(
  UpdateShopPayoutStatusRequestSchema.omit({
    processId: true,
    shopId: true,
    payoutId: true,
  }),
) {}

export class DeleteShopPayoutRequestDto extends createZodDto(
  DeleteShopPayoutRequestSchema.omit({ processId: true, shopId: true }),
) {}

// =====================================================================

export class ShopPayoutResponseDto extends createZodDto(
  ResponseSchema(ShopPayoutResponseSchema),
) {}

export class GetShopPayoutsResponseDto extends createZodDto(
  ResponseSchema(GetShopPayoutsResponseSchema),
) {}
