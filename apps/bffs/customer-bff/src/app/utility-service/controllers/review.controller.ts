import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateReviewRequestDto,
  DeleteReviewRequestDto,
  GetManyReviewsRequestDto,
  GetManyReviewsResponseDto,
  ReviewResponseDto,
  UpdateReviewRequestDto,
} from '@common/interfaces/dtos/utility';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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

  @Post()
  @ApiOkResponse({
    type: ReviewResponseDto,
  })
  async createReview(
    @Body() body: CreateReviewRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.reviewService.createReview({
      ...body,
      userId,
      processId,
    });
  }

  @Put()
  @ApiOkResponse({
    type: ReviewResponseDto,
  })
  async updateReview(
    @Body() body: UpdateReviewRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.reviewService.updateReview({
      ...body,
      userId,
      processId,
      mediaUrls: body.mediaUrls || [],
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
