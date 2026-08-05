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
    return this.prismaService.$transaction(async (tx) => {
      const promotion = await tx.promotion.findUnique({
        where: { id: data.promotionId, deletedAt: null },
      });

      if (!promotion) throw new NotFoundException('Error.PromotionNotFound');

      const existing = await tx.redemption.findUnique({
        where: {
          code_userId: {
            code: data.code,
            userId: data.userId,
          },
        },
      });

      // `orderIds` là cột JSON trên MySQL nên Prisma trả JsonValue.
      // Đọc về string[] trước khi so sánh tập hợp.
      const existingOrderIds = readStringList(existing?.orderIds, {
        model: 'Redemption',
        field: 'orderIds',
        key: existing?.id,
      });

      if (existing?.usedAt) {
        const isSameOrderSet =
          existingOrderIds.length === data.orderIds.length &&
          data.orderIds.every((orderId) => existingOrderIds.includes(orderId));
        if (isSameOrderSet) {
          return toRedemptionRow(existing);
        }
        throw new BadRequestException('Error.PromotionAlreadyUsing');
      }

      const now = new Date();
      const mergedOrderIds = writeStringList(
        existing
          ? Array.from(new Set([...existingOrderIds, ...data.orderIds]))
          : data.orderIds,
      );

      if (!existing) {
        if (
          promotion.totalLimit != null &&
          promotion.usedCount >= promotion.totalLimit
        ) {
          throw new BadRequestException('Error.PromotionOutOfStock');
        }
        await tx.promotion.update({
          where: { id: promotion.id },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });

        const created = await tx.redemption.create({
          data: {
            promotionId: data.promotionId,
            userId: data.userId,
            orderIds: mergedOrderIds,
            code: data.code,
            discountType: data.discountType,
            discountValue: data.discountValue,
            minOrderSubtotal: data.minOrderSubtotal,
            maxDiscount: data.maxDiscount,
            usedAt: now,
          },
        });

        return toRedemptionRow(created);
      }

      await tx.promotion.update({
        where: { id: promotion.id },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });

      const updated = await tx.redemption.update({
        where: { id: existing.id },
        data: {
          orderIds: mergedOrderIds,
          usedAt: now,
          cancelledAt: null,
        },
      });

      return toRedemptionRow(updated);
    });
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
