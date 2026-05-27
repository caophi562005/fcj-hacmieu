import { RedisConfiguration } from '@common/configurations/redis.config';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateReviewRequest,
  DeleteReviewRequest,
  GetManyReviewsRequest,
  GetManyReviewsResponse,
  GetReviewByOrderItemIdRequest,
  GetReviewRequest,
  ReviewResponse,
  UpdateReviewRequest,
} from '@common/interfaces/models/utility';
import {
  AI_SERVICE_PACKAGE_NAME,
  REVIEW_SUMMARY_MODULE_SERVICE_NAME,
  ReviewSummaryModuleClient,
} from '@common/interfaces/proto-types/ai';
import {
  generateReviewByIdCacheKey,
  generateReviewListCacheKey,
} from '@common/utils/cache-key.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import ms, { StringValue } from 'ms';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  onModuleInit() {
    this.reviewSummaryModule =
      this.aiClient.getService<ReviewSummaryModuleClient>(
        REVIEW_SUMMARY_MODULE_SERVICE_NAME,
      );
  }

  async list({
    processId,
    ...data
  }: GetManyReviewsRequest): Promise<GetManyReviewsResponse> {
    const cacheKey = generateReviewListCacheKey(data);
    const cached =
      await this.cacheManager.get<GetManyReviewsResponse>(cacheKey);
    if (cached) return cached;

    const result = await this.reviewRepository.list(data);

    this.cacheManager.set(
      cacheKey,
      result,
      ms(RedisConfiguration.CACHE_REVIEW_TTL as StringValue),
    );
    return result;
  }

  async findById({
    processId,
    ...data
  }: GetReviewRequest): Promise<ReviewResponse> {
    const cacheKey = generateReviewByIdCacheKey(data.id);
    const cached = await this.cacheManager.get<ReviewResponse>(cacheKey);
    if (cached) return cached;

    const review = await this.reviewRepository.findById(data);
    if (!review) {
      throw new NotFoundException('Error.ReviewNotFound');
    }

    this.cacheManager.set(
      cacheKey,
      review,
      ms(RedisConfiguration.CACHE_REVIEW_TTL as StringValue),
    );
    return review;
  }

  async findByOrderItemId({
    processId,
    ...data
  }: GetReviewByOrderItemIdRequest): Promise<ReviewResponse> {
    const review = await this.reviewRepository.findByOrderItemId(data);
    if (!review) {
      throw new NotFoundException('Error.ReviewNotFound');
    }
    return review;
  }

  async create({
    processId,
    ...data
  }: CreateReviewRequest): Promise<ReviewResponse> {
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

  async update({
    processId,
    ...data
  }: UpdateReviewRequest): Promise<ReviewResponse> {
    try {
      const review = await this.reviewRepository.update(data);
      await this.reviewRepository.recalculateRatingAggregate(review.productId);
      this.cacheManager.del(generateReviewByIdCacheKey(review.id));
      return review;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ReviewNotFound');
      }
      throw error;
    }
  }

  async delete({
    processId,
    ...data
  }: DeleteReviewRequest): Promise<ReviewResponse> {
    try {
      const review = await this.reviewRepository.delete(data, false);
      await this.reviewRepository.recalculateRatingAggregate(review.productId);
      this.cacheManager.del(generateReviewByIdCacheKey(review.id));
      return review;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ReviewNotFound');
      }
      throw error;
    }
  }
}
