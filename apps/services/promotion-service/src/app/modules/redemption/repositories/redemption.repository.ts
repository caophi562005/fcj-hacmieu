import { CreatePromotionRedemptionRequest } from '@common/interfaces/models/promotion';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RedemptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreatePromotionRedemptionRequest) {
    const redemption = await this.prismaService.redemption.create({
      data: {
        ...data,
        usedAt: new Date(),
      },
    });
    await this.prismaService.promotion.update({
      where: { id: data.promotionId },
      data: {
        usedCount: { increment: 1 },
      },
    });
    return redemption;
  }
}
