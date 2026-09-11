import { RedemptionStatusValues } from '@common/constants/promotion.constant';
import {
  ClaimPromotionRequest,
  CreatePromotionRedemptionRequest,
  GetMyVouchersRequest,
} from '@common/interfaces/models/promotion';
import {
  readStringList,
  writeStringList,
} from '@common/utils/scalar-list.util';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma-client/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Đưa `orderIds` từ cột JSON về `string[]` để hợp đồng gRPC không đổi.
 */
function toRedemptionRow<T extends { id: string; orderIds: unknown }>(
  row: T,
): Omit<T, 'orderIds'> & { orderIds: string[] } {
  return {
    ...row,
    orderIds: readStringList(row.orderIds, {
      model: 'Redemption',
      field: 'orderIds',
      key: row.id,
    }),
  };
}

@Injectable()
export class RedemptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createFromOrder(data: CreatePromotionRedemptionRequest) {
    const redemptionId = randomUUID();
    try {
      await this.prismaService.$queryRaw`
        CALL sp_use_promotion(
          ${redemptionId}, ${data.promotionId}, ${data.userId},
          ${JSON.stringify(data.orderIds)}
        )
      `;
    } catch (error) {
      const message = String(error);
      if (message.includes('PROMOTION_NOT_FOUND')) {
        throw new NotFoundException('Error.PromotionNotFound');
      }
      if (message.includes('PROMOTION_LIMIT_REACHED')) {
        throw new BadRequestException('Error.PromotionOutOfStock');
      }
      if (message.includes('PROMOTION_ALREADY_USED')) {
        throw new BadRequestException('Error.PromotionAlreadyUsing');
      }
      if (message.includes('PROMOTION_NOT_ACTIVE')) {
        throw new BadRequestException('Error.PromotionNotActive');
      }
      throw error;
    }

    const redemption = await this.prismaService.redemption.findUniqueOrThrow({
      where: {
        promotionId_userId: {
          promotionId: data.promotionId,
          userId: data.userId,
        },
      },
    });
    return toRedemptionRow(redemption);
  }

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

    const claimed = await this.prismaService.redemption.create({
      data: {
        promotionId: promotion.id,
        userId: data.userId,
        orderIds: writeStringList([]),
        code: promotion.code,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        minOrderSubtotal: promotion.minOrderSubtotal,
        maxDiscount: promotion.maxDiscount,
      },
    });

    return toRedemptionRow(claimed);
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
      redemptions: redemptions.map(toRedemptionRow),
    };
  }
}
