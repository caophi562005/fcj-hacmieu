import {
  CreateReplyRequestSchema,
  DeleteReplyRequestSchema,
  UpdateReplyRequestSchema,
} from '@common/interfaces/models/review';
import { createZodDto } from 'nestjs-zod';

export class CreateReplyRequestDto extends createZodDto(
  CreateReplyRequestSchema.omit({ processId: true })
) {}

export class UpdateReplyRequestDto extends createZodDto(
  UpdateReplyRequestSchema.omit({ processId: true })
) {}

export class DeleteReplyRequestDto extends createZodDto(
  DeleteReplyRequestSchema.omit({ processId: true })
) {}
