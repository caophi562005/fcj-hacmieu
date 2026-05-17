import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateVideoRequestSchema,
  DeleteVideoRequestSchema,
  GetManyVideosRequestSchema,
  GetManyVideosResponseSchema,
  GetVideoRequestSchema,
  UpdateVideoRequestSchema,
  VideoResponseSchema,
} from '@common/interfaces/models/utility';
import { createZodDto } from 'nestjs-zod';

export class GetManyVideosRequestDto extends createZodDto(
  GetManyVideosRequestSchema.omit({
    processId: true,
    shopId: true,
  }),
) {}

export class GetVideoRequestDto extends createZodDto(
  GetVideoRequestSchema.omit({
    processId: true,
  }),
) {}

export class CreateVideoRequestDto extends createZodDto(
  CreateVideoRequestSchema.omit({
    processId: true,
    uploadedById: true,
    shopId: true,
  }),
) {}

export class UpdateVideoRequestDto extends createZodDto(
  UpdateVideoRequestSchema.omit({ processId: true, id: true }),
) {}

export class DeleteVideoRequestDto extends createZodDto(
  DeleteVideoRequestSchema.omit({ processId: true }),
) {}

//=================================================================================================

export class VideoResponseDto extends createZodDto(
  ResponseSchema(VideoResponseSchema),
) {}

export class GetManyVideosResponseDto extends createZodDto(
  ResponseSchema(GetManyVideosResponseSchema),
) {}
