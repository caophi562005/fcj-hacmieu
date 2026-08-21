import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  DeleteReviewRequestDto,
  GetManyReviewsRequestDto,
  GetManyReviewsResponseDto,
  GetReviewRequestDto,
  ReviewResponseDto,
} from '@common/interfaces/dtos/utility';
import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReviewService } from '../services/review.service';

@Controller('utility/review')
@ApiTags('Utility/Review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyReviewsResponseDto,
  })
  async getManyReviews(
    @Query() queries: GetManyReviewsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.reviewService.getManyReviews({
      ...queries,
      processId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    type: ReviewResponseDto,
  })
  async getReview(
    @Param() params: GetReviewRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.reviewService.getReview({
      ...params,
      processId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({
    type: ReviewResponseDto,
  })
  async deleteReview(
    @Param() params: DeleteReviewRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.reviewService.deleteReview({
      ...params,
      processId,
    });
  }
}
