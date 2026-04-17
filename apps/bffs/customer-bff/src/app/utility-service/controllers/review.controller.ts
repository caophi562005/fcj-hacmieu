import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateReviewRequestDto,
  DeleteReviewRequestDto,
  GetManyReviewsRequestDto,
  GetManyReviewsResponseDto,
  GetReviewRequestDto,
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

  @Put(':id')
  @ApiOkResponse({
    type: ReviewResponseDto,
  })
  async updateReview(
    @Param('id') id: string,
    @Body() body: UpdateReviewRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.reviewService.updateReview({
      id,
      userId,
      processId,
      content: body.content,
      rating: body.rating,
      mediaUrls: body.mediaUrls || [],
    } as any);
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
