import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  GetDistrictsRequestSchema,
  GetDistrictsResponseSchema,
  GetProvincesResponseSchema,
  GetWardsRequestSchema,
  GetWardsResponseSchema,
} from '@common/interfaces/models/utility';
import { createZodDto } from 'nestjs-zod';

export class GetDistrictsRequestDto extends createZodDto(
  GetDistrictsRequestSchema.omit({ processId: true }),
) {}

export class GetWardsRequestDto extends createZodDto(
  GetWardsRequestSchema.omit({ processId: true }),
) {}

export class GetProvincesResponseDto extends createZodDto(
  ResponseSchema(GetProvincesResponseSchema),
) {}

export class GetDistrictsResponseDto extends createZodDto(
  ResponseSchema(GetDistrictsResponseSchema),
) {}

export class GetWardsResponseDto extends createZodDto(
  ResponseSchema(GetWardsResponseSchema),
) {}
