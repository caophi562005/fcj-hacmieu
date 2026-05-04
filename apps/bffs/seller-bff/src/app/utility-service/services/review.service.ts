import {
  CreateReviewRequest,
  DeleteReviewRequest,
  GetManyReviewsRequest,
  GetReviewByOrderItemIdRequest,
  GetReviewRequest,
  REVIEW_SERVICE_NAME,
  ReviewResponse,
  ReviewServiceClient,
  UpdateReviewRequest,
  UTILITY_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/utility';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReviewService implements OnModuleInit {
  private reviewModule!: ReviewServiceClient;

  constructor(
    @Inject(UTILITY_SERVICE_PACKAGE_NAME)
    private utilityClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.reviewModule =
      this.utilityClient.getService<ReviewServiceClient>(REVIEW_SERVICE_NAME);
  }

  async getManyReviews(data: GetManyReviewsRequest) {
    const response = await firstValueFrom(
      this.reviewModule.getManyReviews(data),
    );
    return {
      ...response,
      reviews: response.reviews.map((review) => ({
        id: review.id,
        userId: review.userId,
        productId: review.productId,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
    };
  }

  async getReview(data: GetReviewRequest): Promise<ReviewResponse> {
    return firstValueFrom(this.reviewModule.getReview(data));
  }

  async getReviewByOrderItemId(
    data: GetReviewByOrderItemIdRequest,
  ): Promise<ReviewResponse> {
    return firstValueFrom(this.reviewModule.getReviewByOrderItemId(data));
  }

  async createReview(data: CreateReviewRequest): Promise<ReviewResponse> {
    return firstValueFrom(this.reviewModule.createReview(data));
  }

  async updateReview(data: UpdateReviewRequest): Promise<ReviewResponse> {
    return firstValueFrom(this.reviewModule.updateReview(data));
  }

  async deleteReview(data: DeleteReviewRequest): Promise<ReviewResponse> {
    return firstValueFrom(this.reviewModule.deleteReview(data));
  }
}
