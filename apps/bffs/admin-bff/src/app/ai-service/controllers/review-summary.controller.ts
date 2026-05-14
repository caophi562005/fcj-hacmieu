import { IsPublic } from '@common/decorators/auth.decorator';
import { ProcessId } from '@common/decorators/process-id.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReviewSummaryService } from '../services/review-summary.service';

@Controller('ai/review-summary')
@ApiTags('AI/ReviewSummary')
@IsPublic()
export class ReviewSummaryController {
  constructor(private readonly reviewSummaryService: ReviewSummaryService) {}

  @Get(':productId')
  async getReviewSummary(
    @Param('productId') productId: string,
    @ProcessId() processId: string,
  ) {
    return this.reviewSummaryService.getReviewSummary(productId);
  }
}
