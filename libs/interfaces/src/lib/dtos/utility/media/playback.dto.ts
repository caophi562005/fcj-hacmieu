import {
  GetPlaybackRequestSchema,
  GetPlaybackResponseSchema,
} from '@common/interfaces/models/utility';
import { createZodDto } from 'nestjs-zod';

export class GetPlaybackRequestDto extends createZodDto(
  GetPlaybackRequestSchema,
) {}

export class GetPlaybackResponseDto extends createZodDto(
  GetPlaybackResponseSchema,
) {}
