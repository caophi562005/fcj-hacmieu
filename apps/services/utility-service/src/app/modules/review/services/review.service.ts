import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateReviewRequest,
  DeleteReviewRequest,
  GetManyReviewsRequest,
  GetReviewByOrderItemIdRequest,
  GetReviewRequest,
  UpdateReviewRequest,
} from '@common/interfaces/models/utility';
import {
  AI_SERVICE_PACKAGE_NAME,
  REVIEW_SUMMARY_MODULE_SERVICE_NAME,
  ReviewSummaryModuleClient,
} from '@common/interfaces/proto-types/ai';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ReviewRepository } from '../repositories/review.repository';

@Injectable()
export class ReviewService implements OnModuleInit {
  private readonly logger = new Logger(ReviewService.name);
  private reviewSummaryModule!: ReviewSummaryModuleClient;

  constructor(
    private readonly reviewRepository: ReviewRepository,
    @Inject(AI_SERVICE_PACKAGE_NAME)
    private readonly aiClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.reviewSummaryModule =
      this.aiClient.getService<ReviewSummaryModuleClient>(
        REVIEW_SUMMARY_MODULE_SERVICE_NAME,
      );
  }

  async list({ processId, ...data }: GetManyReviewsRequest) {
    return this.reviewRepository.list(data);
  }

  async findById({ processId, ...data }: GetReviewRequest) {
    const review = await this.reviewRepository.findById(data);

    if (!review) {
      throw new NotFoundException('Error.ReviewNotFound');
    }

    return review;
  }

  async findByOrderItemId({
    processId,
    ...data
  }: GetReviewByOrderItemIdRequest) {
    const review = await this.reviewRepository.findByOrderItemId(data);

    if (!review) {
      throw new NotFoundException('Error.ReviewNotFound');
    }

    return review;
  }

  async create({ processId, ...data }: CreateReviewRequest) {
    const review = await this.reviewRepository.create(data);
    await this.reviewRepository.recalculateRatingAggregate(review.productId);

    // Fire-and-forget: trigger AI summary regeneration
    firstValueFrom(
      this.reviewSummaryModule.generateReviewSummary({
        productId: review.productId,
      }),
    ).catch((error) => {
      this.logger.warn(
        `Failed to trigger AI summary for product ${review.productId}:`,
        error?.message,
      );
    });

    return review;
  }

  async update({ processId, ...data }: UpdateReviewRequest) {
    try {
      const review = await this.reviewRepository.update(data);
      await this.reviewRepository.recalculateRatingAggregate(review.productId);
      return review;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ReviewNotFound');
      }
      throw error;
    }
  }

  async delete({ processId, ...data }: DeleteReviewRequest) {
    try {
      const review = await this.reviewRepository.delete(data, false);
      await this.reviewRepository.recalculateRatingAggregate(review.productId);
      return review;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ReviewNotFound');
      }
      throw error;
    }
  }
}
