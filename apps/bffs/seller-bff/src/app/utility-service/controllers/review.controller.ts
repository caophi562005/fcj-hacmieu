import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  GetManyReviewsRequestDto,
  GetManyReviewsResponseDto,
  GetReviewByOrderItemIdRequestDto,
  ReviewResponseDto,
} from '@common/interfaces/dtos/utility';
import {
  Controller,
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

  @Get(':orderItemId')
  @ApiOkResponse({
    type: ReviewResponseDto,
  })
  async getReviewByOrderItemId(
    @Param() params: GetReviewByOrderItemIdRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.reviewService.getReviewByOrderItemId({
      ...params,
      processId,
      userId,
    });
  }

}
