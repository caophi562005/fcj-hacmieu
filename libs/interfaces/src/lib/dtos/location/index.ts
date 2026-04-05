import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  GetManyDistrictsRequestSchema,
  GetManyDistrictsResponseSchema,
  GetManyProvincesResponseSchema,
  GetManyWardsRequestSchema,
  GetManyWardsResponseSchema,
} from '@common/interfaces/models/location';
import { createZodDto } from 'nestjs-zod';

export class GetManyDistrictsRequestDto extends createZodDto(
  GetManyDistrictsRequestSchema.omit({ processId: true })
) {}

export class GetManyWardsRequestDto extends createZodDto(
  GetManyWardsRequestSchema.omit({ processId: true })
) {}

//======================================================
export class GetManyProvincesResponseDto extends createZodDto(
  ResponseSchema(GetManyProvincesResponseSchema)
) {}

export class GetManyDistrictsResponseDto extends createZodDto(
  ResponseSchema(GetManyDistrictsResponseSchema)
) {}

export class GetManyWardsResponseDto extends createZodDto(
  ResponseSchema(GetManyWardsResponseSchema)
) {}
