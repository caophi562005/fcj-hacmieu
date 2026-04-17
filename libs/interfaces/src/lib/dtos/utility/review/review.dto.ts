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
  GetManyReviewsRequestSchema,
) {}

export class GetReviewRequestDto extends createZodDto(GetReviewRequestSchema) {}

export class CreateReviewRequestDto extends createZodDto(
  CreateReviewRequestSchema,
) {}

export class UpdateReviewRequestDto extends createZodDto(
  UpdateReviewRequestSchema,
) {}

export class DeleteReviewRequestDto extends createZodDto(
  DeleteReviewRequestSchema,
) {}

export class GetManyReviewsResponseDto extends createZodDto(
  ResponseSchema(GetManyReviewsResponseSchema),
) {}

export class ReviewResponseDto extends createZodDto(
  ResponseSchema(ReviewResponseSchema),
) {}
