import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  DeleteVideoRequestSchema,
  GetManyVideosRequestSchema,
  GetManyVideosResponseSchema,
  GetRandomVideosRequestSchema,
  GetVideoRequestSchema,
  GetVideoResponseSchema,
  UpdateVideoRequestSchema,
} from '@common/interfaces/models/utility';
import { createZodDto } from 'nestjs-zod';

export class GetManyVideosRequestDto extends createZodDto(
  GetManyVideosRequestSchema,
) {}

export class GetVideoRequestDto extends createZodDto(GetVideoRequestSchema) {}

export class GetRandomVideosRequestDto extends createZodDto(
  GetRandomVideosRequestSchema.omit({ processId: true }),
) {}

export class UpdateVideoRequestDto extends createZodDto(
  UpdateVideoRequestSchema.omit({ processId: true }),
) {}

export class DeleteVideoRequestDto extends createZodDto(
  DeleteVideoRequestSchema.omit({ processId: true }),
) {}

export class GetManyVideosResponseDto extends createZodDto(
  ResponseSchema(GetManyVideosResponseSchema),
) {}

export class GetVideoResponseDto extends createZodDto(
  ResponseSchema(GetVideoResponseSchema),
) {}
