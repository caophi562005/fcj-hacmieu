import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateShopRequestSchema,
  DeleteShopRequestSchema,
  GetManyShopsRequestSchema,
  GetManyShopsResponseSchema,
  GetShopRequestSchema,
  ShopResponseSchema,
  UpdateShopRequestSchema,
} from '@common/interfaces/models/shop';
import { createZodDto } from 'nestjs-zod';

export class GetManyShopsRequestDto extends createZodDto(
  GetManyShopsRequestSchema.omit({
    processId: true,
  }),
) {}

export class GetShopRequestDto extends createZodDto(
  GetShopRequestSchema.omit({
    processId: true,
  }),
) {}

export class CreateShopRequestDto extends createZodDto(
  CreateShopRequestSchema.omit({ processId: true, createdById: true }),
) {}

export class UpdateShopRequestDto extends createZodDto(
  UpdateShopRequestSchema.omit({ processId: true, updatedById: true }),
) {}

export class DeleteShopRequestDto extends createZodDto(
  DeleteShopRequestSchema.omit({ processId: true, deletedById: true }),
) {}

// ====================================================================================================

export class GetManyShopsResponseDto extends createZodDto(
  ResponseSchema(GetManyShopsResponseSchema),
) {}

export class GetShopResponseDto extends createZodDto(
  ResponseSchema(ShopResponseSchema),
) {}
