import { RedemptionStatusValues } from '@common/constants/promotion.constant';
import {
  ClaimPromotionRequest,
  GetMyVouchersRequest,
} from '@common/interfaces/models/promotion';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma-client/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RedemptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async claim(data: ClaimPromotionRequest) {
    const promotion = await this.prismaService.promotion.findUnique({
      where: { id: data.promotionId, deletedAt: null },
    });
    if (!promotion) throw new NotFoundException('Error.PromotionNotFound');

    if (promotion.status !== 'ACTIVE') {
      throw new BadRequestException('Error.PromotionNotActive');
    }

    const now = new Date();
    if (promotion.startsAt && promotion.startsAt > now) {
      throw new BadRequestException('Error.PromotionNotStarted');
    }
    if (promotion.endsAt && promotion.endsAt < now) {
      throw new BadRequestException('Error.PromotionExpired');
    }

    if (
      promotion.totalLimit != null &&
      promotion.usedCount >= promotion.totalLimit
    ) {
      throw new BadRequestException('Error.PromotionOutOfStock');
    }

    return this.prismaService.redemption.create({
      data: {
        promotionId: promotion.id,
        userId: data.userId,
        orderIds: [],
        code: promotion.code,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        minOrderSubtotal: promotion.minOrderSubtotal,
        maxDiscount: promotion.maxDiscount,
      },
    });
  }

  async listByUser(data: GetMyVouchersRequest) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.RedemptionWhereInput = { userId: data.userId };
    if (data.status === RedemptionStatusValues.AVAILABLE) {
      where.usedAt = null;
      where.cancelledAt = null;
    } else if (data.status === RedemptionStatusValues.USED) {
      where.usedAt = { not: null };
    } else if (data.status === RedemptionStatusValues.CANCELLED) {
      where.cancelledAt = { not: null };
    }

    const [redemptions, totalItems] = await Promise.all([
      this.prismaService.redemption.findMany({
        where,
        orderBy: { claimedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.redemption.count({ where }),
    ]);

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      redemptions,
    };
  }
}
