import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateProductReviewRequestSchema,
  DeleteProductReviewRequestSchema,
  GetManyProductReviewsRequestSchema,
  GetManyProductReviewsResponseSchema,
  ReviewResponseSchema,
  UpdateProductReviewsRequestSchema,
} from '@common/interfaces/models/review';
import { createZodDto } from 'nestjs-zod';

export class GetManyProductReviewsRequestDto extends createZodDto(
  GetManyProductReviewsRequestSchema.omit({ processId: true })
) {}

export class CreateProductReviewRequestDto extends createZodDto(
  CreateProductReviewRequestSchema.omit({ processId: true })
) {}

export class UpdateProductReviewRequestDto extends createZodDto(
  UpdateProductReviewsRequestSchema.omit({ processId: true })
) {}

export class DeleteProductReviewRequestDto extends createZodDto(
  DeleteProductReviewRequestSchema.omit({ processId: true })
) {}
// =================================================================================
export class GetManyProductReviewsResponseDto extends createZodDto(
  ResponseSchema(GetManyProductReviewsResponseSchema)
) {}

export class ReviewResponseDto extends createZodDto(
  ResponseSchema(ReviewResponseSchema)
) {}
