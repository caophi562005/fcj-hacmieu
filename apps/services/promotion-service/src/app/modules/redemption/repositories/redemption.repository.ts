import { RedemptionStatusValues } from '@common/constants/promotion.constant';
import {
  ClaimPromotionRequest,
  CreatePromotionRedemptionRequest,
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

  async createFromOrder(data: CreatePromotionRedemptionRequest) {
    return this.prismaService.$transaction(async (tx) => {
      const promotion = await tx.promotion.findUnique({
        where: { id: data.promotionId, deletedAt: null },
      });

      if (!promotion) throw new NotFoundException('Error.PromotionNotFound');

      const cancelled = await tx.redemptionCancellation.findMany({
        where: { orderId: { in: data.orderIds } },
        select: { orderId: true },
      });
      const cancelledIds = new Set(cancelled.map((item) => item.orderId));
      const activeOrderIds = data.orderIds.filter(
        (orderId) => !cancelledIds.has(orderId),
      );
      const existing = await tx.redemption.findUnique({
        where: {
          code_userId: {
            code: data.code,
            userId: data.userId,
          },
        },
      });

      if (existing?.usedAt) {
        const isSameOrderSet =
          existing.orderIds.length === activeOrderIds.length &&
          activeOrderIds.every((orderId) => existing.orderIds.includes(orderId));
        if (isSameOrderSet) {
          return existing;
        }
        throw new BadRequestException('Error.PromotionAlreadyUsing');
      }

      const now = new Date();
      const mergedOrderIds = existing
        ? Array.from(new Set([...existing.orderIds, ...activeOrderIds]))
        : activeOrderIds;

      if (!existing) {
        if (mergedOrderIds.length === 0) {
          return tx.redemption.create({
            data: {
              promotionId: data.promotionId,
              userId: data.userId,
              orderIds: [],
              code: data.code,
              discountType: data.discountType,
              discountValue: data.discountValue,
              minOrderSubtotal: data.minOrderSubtotal,
              maxDiscount: data.maxDiscount,
            },
          });
        }
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

        return tx.redemption.create({
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
      }

      await tx.promotion.update({
        where: { id: promotion.id },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });

      return tx.redemption.update({
        where: { id: existing.id },
        data: {
          orderIds: mergedOrderIds,
          usedAt: now,
          cancelledAt: null,
        },
      });
    });
  }

  async releaseOrder(data: { orderId: string; eventId: string }) {
    return this.prismaService.$transaction(
      async (tx) => {
        await tx.redemptionCancellation.upsert({
          where: { orderId: data.orderId },
          update: {},
          create: data,
        });
        const redemption = await tx.redemption.findFirst({
          where: { orderIds: { has: data.orderId } },
        });
        if (!redemption) return { releasedUsage: false };

        const remainingOrderIds = redemption.orderIds.filter(
          (orderId) => orderId !== data.orderId,
        );
        if (remainingOrderIds.length > 0) {
          await tx.redemption.update({
            where: { id: redemption.id },
            data: { orderIds: remainingOrderIds },
          });
          return { releasedUsage: false };
        }

        await tx.redemption.update({
          where: { id: redemption.id },
          data: { orderIds: [], usedAt: null, cancelledAt: null },
        });
        if (redemption.usedAt) {
          await tx.promotion.updateMany({
            where: { id: redemption.promotionId, usedCount: { gt: 0 } },
            data: { usedCount: { decrement: 1 } },
          });
        }
        return { releasedUsage: Boolean(redemption.usedAt) };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
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
      const now = new Date();
      where.usedAt = null;
      where.cancelledAt = null;
      where.promotion = {
        status: 'ACTIVE',
        deletedAt: null,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      };
    } else if (data.status === RedemptionStatusValues.USED) {
      where.usedAt = { not: null };
    } else if (data.status === RedemptionStatusValues.CANCELLED) {
      where.cancelledAt = { not: null };
    }

    const [redemptions, totalItems] = await Promise.all([
      this.prismaService.redemption.findMany({
        where,
        include: {
          promotion: {
            select: { endsAt: true, status: true },
          },
        },
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
      redemptions: redemptions.map(({ promotion, ...redemption }) => ({
        ...redemption,
        promotionEndsAt: promotion.endsAt,
        promotionStatus: promotion.status,
      })),
    };
  }
}
