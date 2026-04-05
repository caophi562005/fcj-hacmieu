import {
  GetPlaybackRequestSchema,
  GetPlaybackResponseSchema,
} from '@common/interfaces/models/media';
import { createZodDto } from 'nestjs-zod';

export class GetPlaybackRequestDto extends createZodDto(
  GetPlaybackRequestSchema
) {}

export class GetPlaybackResponseDto extends createZodDto(
  GetPlaybackResponseSchema
) {}
