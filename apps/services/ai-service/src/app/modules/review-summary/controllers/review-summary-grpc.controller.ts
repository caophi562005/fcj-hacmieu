import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import type {
  GenerateReviewSummaryRequest,
  GetReviewSummaryRequest,
} from '@common/interfaces/models/ai';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ReviewSummaryService } from '../services/review-summary.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class ReviewSummaryGrpcController {
  constructor(private readonly reviewSummaryService: ReviewSummaryService) {}

  @GrpcMethod('ReviewSummaryModule', 'GetReviewSummary')
  async getReviewSummary(data: GetReviewSummaryRequest) {
    const result = await this.reviewSummaryService.getReviewSummary(
      data.productId,
    );
    if (!result) {
      return {
        id: '',
        productId: data.productId,
        pros: [],
        cons: [],
        summary: '',
        reviewCount: 0,
        lastReviewAt: '',
        createdAt: '',
        updatedAt: '',
      };
    }
    return {
      ...result,
      lastReviewAt: result.lastReviewAt.toISOString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('ReviewSummaryModule', 'GenerateReviewSummary')
  async generateReviewSummary(data: GenerateReviewSummaryRequest) {
    const result = await this.reviewSummaryService.generateReviewSummary(
      data.productId,
    );
    if (!result) {
      return {
        id: '',
        productId: data.productId,
        pros: [],
        cons: [],
        summary: '',
        reviewCount: 0,
        lastReviewAt: '',
        createdAt: '',
        updatedAt: '',
      };
    }
    return {
      ...result,
      lastReviewAt: result.lastReviewAt.toISOString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }
}
