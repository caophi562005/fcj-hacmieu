import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  ClaimPromotionRequest,
  GetMyVouchersRequest,
  GetMyVouchersResponse,
  PromotionRedemptionResponse,
} from '@common/interfaces/models/promotion';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedemptionRepository } from '../repositories/redemption.repository';

@Injectable()
export class RedemptionService {
  constructor(private readonly redemptionRepository: RedemptionRepository) {}

  async claim({
    processId: _,
    ...data
  }: ClaimPromotionRequest): Promise<PromotionRedemptionResponse> {
    try {
      return await this.redemptionRepository.claim(data);
    } catch (error) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictException('Error.PromotionAlreadyClaimed');
      }
      throw error;
    }
  }

  async getMyVouchers({
    processId: _,
    ...data
  }: GetMyVouchersRequest): Promise<GetMyVouchersResponse> {
    const result = await this.redemptionRepository.listByUser(data);
    if (result.totalItems === 0) {
      throw new NotFoundException('Error.PromotionRedemptionNotFound');
    }
    return result;
  }
}
