import {
  AI_SERVICE_PACKAGE_NAME,
  REVIEW_SUMMARY_MODULE_SERVICE_NAME,
  ReviewSummaryModuleClient,
  type ReviewSummaryResponse,
} from '@common/interfaces/proto-types/ai';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReviewSummaryService implements OnModuleInit {
  private reviewSummaryModule!: ReviewSummaryModuleClient;

  constructor(
    @Inject(AI_SERVICE_PACKAGE_NAME)
    private readonly aiClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.reviewSummaryModule =
      this.aiClient.getService<ReviewSummaryModuleClient>(
        REVIEW_SUMMARY_MODULE_SERVICE_NAME,
      );
  }

  async getReviewSummary(productId: string): Promise<ReviewSummaryResponse> {
    const response = await firstValueFrom(
      this.reviewSummaryModule.getReviewSummary({ productId }),
    );
    return {
      ...response,
      pros: response.pros ?? [],
      cons: response.cons ?? [],
    };
  }
}
