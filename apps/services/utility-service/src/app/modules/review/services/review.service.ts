import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateReviewRequest,
  DeleteReviewRequest,
  GetManyReviewsRequest,
  GetManyReviewsResponse,
  GetReviewRequest,
  ReviewResponse,
  UpdateReviewRequest,
} from '@common/interfaces/models/utility';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewRepository } from '../repositories/review.repository';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async list({
    processId,
    ...data
  }: GetManyReviewsRequest): Promise<GetManyReviewsResponse> {
    return this.reviewRepository.list(data);
  }

  async findById({
    processId,
    ...data
  }: GetReviewRequest): Promise<ReviewResponse> {
    const review = await this.reviewRepository.findById(data);

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
    return review;
  }

  async update({
    processId,
    ...data
  }: UpdateReviewRequest): Promise<ReviewResponse> {
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

  async delete({
    processId,
    ...data
  }: DeleteReviewRequest): Promise<ReviewResponse> {
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
