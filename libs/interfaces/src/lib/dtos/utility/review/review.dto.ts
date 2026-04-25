import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateReviewRequestSchema,
  DeleteReviewRequestSchema,
  GetManyReviewsRequestSchema,
  GetManyReviewsResponseSchema,
  GetReviewRequestSchema,
  ReviewResponseSchema,
  UpdateReviewRequestSchema,
} from '@common/interfaces/models/utility';
import { createZodDto } from 'nestjs-zod';

export class GetManyReviewsRequestDto extends createZodDto(
  GetManyReviewsRequestSchema.omit({ processId: true }),
) {}

export class GetReviewRequestDto extends createZodDto(GetReviewRequestSchema) {}

export class CreateReviewRequestDto extends createZodDto(
  CreateReviewRequestSchema.omit({ processId: true }),
) {}

export class UpdateReviewRequestDto extends createZodDto(
  UpdateReviewRequestSchema.omit({ processId: true }),
) {}

export class DeleteReviewRequestDto extends createZodDto(
  DeleteReviewRequestSchema.omit({ processId: true }),
) {}

export class GetManyReviewsResponseDto extends createZodDto(
  ResponseSchema(GetManyReviewsResponseSchema),
) {}

export class ReviewResponseDto extends createZodDto(
  ResponseSchema(ReviewResponseSchema),
) {}
