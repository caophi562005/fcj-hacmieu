import { RedisConfiguration } from '@common/configurations/redis.config';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import { OrderStatusValues } from '@common/constants/order.constant';
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
  ORDER_MODULE_SERVICE_NAME,
  ORDER_SERVICE_PACKAGE_NAME,
  OrderModuleClient,
} from '@common/interfaces/proto-types/order';
import {
  generateReviewByIdCacheKey,
  generateReviewListCacheKey,
} from '@common/utils/cache-key.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
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
  private orderModule!: OrderModuleClient;

  constructor(
    private readonly reviewRepository: ReviewRepository,
    @Inject(AI_SERVICE_PACKAGE_NAME)
    private readonly aiClient: ClientGrpc,
    @Inject(ORDER_SERVICE_PACKAGE_NAME)
    private readonly orderClient: ClientGrpc,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  onModuleInit() {
    this.reviewSummaryModule =
      this.aiClient.getService<ReviewSummaryModuleClient>(
        REVIEW_SUMMARY_MODULE_SERVICE_NAME,
      );
    this.orderModule = this.orderClient.getService<OrderModuleClient>(
      ORDER_MODULE_SERVICE_NAME,
    );
  }

  private async getReviewListCacheVersion(productId?: string): Promise<number> {
    if (!productId) return 1;
    const versionKey = `utility:review:version:${productId}`;
    const version = await this.cacheManager.get<number>(versionKey);
    return version || 1;
  }

  private async invalidateReviewListCache(productId: string): Promise<void> {
    const versionKey = `utility:review:version:${productId}`;
    const version = (await this.cacheManager.get<number>(versionKey)) || 1;
    await this.cacheManager.set(versionKey, version + 1, ms('7d'));
  }

  async list({
    processId,
    ...data
  }: GetManyReviewsRequest): Promise<GetManyReviewsResponse> {
    const version = await this.getReviewListCacheVersion(data.productId);
    const cacheKey = generateReviewListCacheKey(data, version);
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
    const order = await firstValueFrom(
      this.orderModule.getOrder({
        processId,
        orderId: data.orderId,
        userId: data.userId,
      }),
    );
    const orderItem = order.itemsSnapshot.find(
      (item) => item.id === data.orderItemId,
    );
    if (
      order.status !== OrderStatusValues.COMPLETED ||
      order.shopId !== data.sellerId ||
      !orderItem ||
      orderItem.productId !== data.productId
    ) {
      throw new BadRequestException('Error.ReviewNotEligible');
    }

    const review = await this.reviewRepository.create(data);
    await this.reviewRepository.recalculateRatingAggregate(review.productId);
    await this.invalidateReviewListCache(review.productId);

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
      await this.invalidateReviewListCache(review.productId);
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
      await this.invalidateReviewListCache(review.productId);
      return review;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ReviewNotFound');
      }
      throw error;
    }
  }
}
