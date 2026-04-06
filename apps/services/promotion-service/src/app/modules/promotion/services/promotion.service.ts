import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CheckPromotionRequest,
  CreatePromotionRequest,
  DeletePromotionRequest,
  GetManyPromotionsRequest,
  GetManyPromotionsResponse,
  GetPromotionRequest,
  PromotionResponse,
  UpdatePromotionRequest,
} from '@common/interfaces/models/promotion';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PromotionRepository } from '../repositories/promotion.repository';

@Injectable()
export class PromotionService {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async list(
    data: GetManyPromotionsRequest
  ): Promise<GetManyPromotionsResponse> {
    const promotions = await this.promotionRepository.list(data);
    if (promotions.totalItems === 0) {
      throw new NotFoundException('Error.PromotionsNotFound');
    }
    return promotions;
  }

  async findById(data: GetPromotionRequest): Promise<PromotionResponse> {
    const promotion = await this.promotionRepository.findById(data);
    if (!promotion) {
      throw new NotFoundException('Error.PromotionNotFound');
    }
    return promotion;
  }

  async create({
    processId,
    ...data
  }: CreatePromotionRequest): Promise<PromotionResponse> {
    try {
      const createdPromotion = await this.promotionRepository.create(data);
      return createdPromotion;
    } catch (error) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.PromotionAlreadyExists');
      }
      throw error;
    }
  }

  async update({
    processId,
    ...data
  }: UpdatePromotionRequest): Promise<PromotionResponse> {
    try {
      const updatedPromotion = await this.promotionRepository.update(data);
      return updatedPromotion;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.PromotionNotFound');
      }
      throw error;
    }
  }

  async delete(data: DeletePromotionRequest): Promise<PromotionResponse> {
    try {
      const deletedPromotion = await this.promotionRepository.delete(
        data,
        false
      );
      return deletedPromotion;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.PromotionNotFound');
      }
      throw error;
    }
  }

  async check(data: CheckPromotionRequest): Promise<PromotionResponse> {
    try {
      const promotion = await this.promotionRepository.check(data);
      return promotion;
    } catch (error) {
      throw error;
    }
  }
}
