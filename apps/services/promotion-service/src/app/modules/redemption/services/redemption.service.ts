import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreatePromotionRedemptionRequest,
  PromotionRedemptionResponse,
} from '@common/interfaces/models/promotion';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RedemptionRepository } from '../repositories/redemption.repository';

@Injectable()
export class RedemptionService {
  constructor(private readonly redemptionRepository: RedemptionRepository) {}

  async create({
    processId,
    ...data
  }: CreatePromotionRedemptionRequest): Promise<PromotionRedemptionResponse> {
    try {
      const createdPromotionRedemption = await this.redemptionRepository.create(
        data
      );
      return createdPromotionRedemption;
    } catch (error) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.PromotionRedemptionAlreadyExists');
      }
      throw error;
    }
  }
}
