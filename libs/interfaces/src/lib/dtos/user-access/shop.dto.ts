import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateShopRequestSchema,
  GetManyShopsRequestSchema,
  GetManyShopsResponseSchema,
  GetShopRequestSchema,
  UpdateShopRequestSchema,
} from '@common/interfaces/models/user-access';
import { ShopSchema } from '@common/schemas/user-access';
import { createZodDto } from 'nestjs-zod';

export class GetShopRequestDto extends createZodDto(GetShopRequestSchema) {}

export class GetManyShopsRequestDto extends createZodDto(
  GetManyShopsRequestSchema.omit({
    processId: true,
  })
) {}

export class CreateShopRequestDto extends createZodDto(
  CreateShopRequestSchema
) {}

export class UpdateShopRequestDto extends createZodDto(
  UpdateShopRequestSchema
) {}

export class GetShopResponseDto extends createZodDto(
  ResponseSchema(ShopSchema)
) {}

export class GetManyShopsResponseDto extends createZodDto(
  ResponseSchema(GetManyShopsResponseSchema)
) {}
