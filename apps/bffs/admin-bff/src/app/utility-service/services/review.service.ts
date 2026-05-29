import {
  CreateReviewRequest,
  DeleteReviewRequest,
  GetManyReviewsRequest,
  GetManyReviewsResponse,
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

import {
  IAM_SERVICE_PACKAGE_NAME,
  UserModuleClient,
  USER_MODULE_SERVICE_NAME,
} from '@common/interfaces/proto-types/iam';

@Injectable()
export class ReviewService implements OnModuleInit {
  private reviewModule!: ReviewServiceClient;
  private userModule!: UserModuleClient;

  constructor(
    @Inject(UTILITY_SERVICE_PACKAGE_NAME)
    private utilityClient: ClientGrpc,
    @Inject(IAM_SERVICE_PACKAGE_NAME)
    private iamClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.reviewModule =
      this.utilityClient.getService<ReviewServiceClient>(REVIEW_SERVICE_NAME);
    this.userModule = this.iamClient.getService<UserModuleClient>(
      USER_MODULE_SERVICE_NAME,
    );
  }

  async getManyReviews(
    data: GetManyReviewsRequest,
  ): Promise<GetManyReviewsResponse> {
    const response = await firstValueFrom(
      this.reviewModule.getManyReviews(data),
    );
    const reviews = response.reviews ?? [];

    const userIds = [...new Set(reviews.map((r) => r.userId))].filter(Boolean);
    let usersMap = new Map<string, any>();
    if (userIds.length > 0) {
      try {
        const usersRes = await firstValueFrom(
          this.userModule.getManyUsers({
            ids: userIds,
            page: 1,
            limit: userIds.length,
            group: [],
          }),
        );
        usersMap = new Map((usersRes.users ?? []).map((u) => [u.id, u]));
      } catch (err) {
        console.error('Error fetching users for reviews', err);
      }
    }

    return {
      ...response,
      reviews: reviews.map((review) => {
        const user = usersMap.get(review.userId);
        return {
          id: review.id,
          userId: review.userId,
          productId: review.productId,
          rating: review.rating,
          content: review.content,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          orderId: review.orderId,
          orderItemId: review.orderItemId,
          sellerId: review.sellerId,
          mediaUrls: review.mediaUrls || [],
          user: user
            ? {
                username: user.username,
                avatar: user.avatar,
              }
            : undefined,
        };
      }),
    };
  }

  async getReview(data: GetReviewRequest): Promise<ReviewResponse> {
    return firstValueFrom(this.reviewModule.getReview(data));
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
