import { AppConfiguration } from '@common/configurations/app.config';
import {
  CreditTransactionSourceValues,
  CreditTransactionTypeValues,
} from '@common/constants/credit.constant';
import { ProductPlacementStatusValues } from '@common/constants/product-placement.constant';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CancelProductPlacementRequest,
  CreateProductPlacementRequest,
  GetProductPlacementsRequest,
} from '@common/interfaces/models/wallet';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma-client/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProductPlacementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countActive(now = new Date()) {
    return this.prisma.productPlacement.count({
      where: {
        status: ProductPlacementStatusValues.ACTIVE,
        endsAt: { gt: now },
      },
    });
  }

  async findByIdempotencyKey(idempotencyKey: string) {
    return this.prisma.productPlacement.findUnique({
      where: { idempotencyKey },
    });
  }

  async create(data: CreateProductPlacementRequest, amount: number) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const existing = await tx.productPlacement.findUnique({
              where: { idempotencyKey: data.idempotencyKey },
            });
            if (existing) {
              if (
                existing.shopId !== data.shopId ||
                existing.productId !== data.productId ||
                existing.durationDays !== data.durationDays
              ) {
                throw new ConflictException('Error.IdempotencyKeyAlreadyUsed');
              }
              return existing;
            }

            const now = new Date();
            const active = await tx.productPlacement.findMany({
              where: {
                status: ProductPlacementStatusValues.ACTIVE,
                endsAt: { gt: now },
              },
              select: { shopId: true, position: true },
              orderBy: { position: 'asc' },
            });

            if (active.some((item) => item.shopId === data.shopId)) {
              throw new ConflictException(
                'Error.ShopAlreadyHasActivePlacement',
              );
            }
            if (active.length >= AppConfiguration.HOME_PLACEMENT_MAX_ACTIVE) {
              throw new ConflictException('Error.ProductPlacementSlotsFull');
            }

            const occupied = new Set(active.map((item) => item.position));
            const position = Array.from(
              { length: AppConfiguration.HOME_PLACEMENT_MAX_ACTIVE },
              (_, index) => index + 1,
            ).find((candidate) => !occupied.has(candidate));
            if (!position) {
              throw new ConflictException('Error.ProductPlacementSlotsFull');
            }

            const credit = await tx.credit.upsert({
              where: { shopId: data.shopId },
              update: {},
              create: { shopId: data.shopId, balance: 0 },
            });
            const debited = await tx.credit.updateMany({
              where: { id: credit.id, balance: { gte: amount } },
              data: { balance: { decrement: amount } },
            });
            if (debited.count !== 1) {
              throw new BadRequestException('Error.CreditInsufficientBalance');
            }

            const updatedCredit = await tx.credit.findUniqueOrThrow({
              where: { id: credit.id },
            });
            const startsAt = now;
            const endsAt = new Date(
              startsAt.getTime() + data.durationDays * 24 * 60 * 60 * 1000,
            );
            const placement = await tx.productPlacement.create({
              data: {
                idempotencyKey: data.idempotencyKey,
                creditId: credit.id,
                shopId: data.shopId,
                productId: data.productId,
                position,
                amount,
                durationDays: data.durationDays,
                startsAt,
                endsAt,
              },
            });

            await tx.creditTransaction.create({
              data: {
                creditId: credit.id,
                shopId: data.shopId,
                type: CreditTransactionTypeValues.DEBIT,
                source: CreditTransactionSourceValues.PRODUCT_PLACEMENT,
                referenceId: placement.id,
                amount,
                balanceAfter: updatedCredit.balance,
                description: `Mua vị trí sản phẩm nổi bật trong ${data.durationDays} ngày`,
              },
            });
            return placement;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (error?.code === 'P2034' && attempt < 2) continue;
        if (error?.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
          const existing = await this.findByIdempotencyKey(data.idempotencyKey);
          if (existing) {
            if (
              existing.shopId !== data.shopId ||
              existing.productId !== data.productId ||
              existing.durationDays !== data.durationDays
            ) {
              throw new ConflictException('Error.IdempotencyKeyAlreadyUsed');
            }
            return existing;
          }
          if (attempt < 2) continue;
        }
        throw error;
      }
    }
    throw new ConflictException('Error.ProductPlacementConcurrentUpdate');
  }

  async list(data: GetProductPlacementsRequest) {
    const page = data.page || 1;
    const limit = data.limit || 20;
    const where: Prisma.ProductPlacementWhereInput = {};
    if (data.shopId) where.shopId = data.shopId;
    const now = new Date();
    if (data.status === ProductPlacementStatusValues.ACTIVE) {
      where.status = ProductPlacementStatusValues.ACTIVE;
      where.endsAt = { gt: now };
    } else if (data.status === ProductPlacementStatusValues.EXPIRED) {
      where.status = ProductPlacementStatusValues.ACTIVE;
      where.endsAt = { lte: now };
    } else if (data.status === ProductPlacementStatusValues.CANCELLED) {
      where.status = ProductPlacementStatusValues.CANCELLED;
    }
    const [placements, totalItems] = await Promise.all([
      this.prisma.productPlacement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.productPlacement.count({ where }),
    ]);
    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      placements,
    };
  }

  async listActive() {
    const now = new Date();
    const placements = await this.prisma.productPlacement.findMany({
      where: {
        status: ProductPlacementStatusValues.ACTIVE,
        startsAt: { lte: now },
        endsAt: { gt: now },
      },
      orderBy: { position: 'asc' },
      take: AppConfiguration.HOME_PLACEMENT_MAX_ACTIVE,
    });
    return {
      page: 1,
      limit: AppConfiguration.HOME_PLACEMENT_MAX_ACTIVE,
      totalItems: placements.length,
      totalPages: placements.length ? 1 : 0,
      placements,
    };
  }

  async cancel(data: CancelProductPlacementRequest) {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const cancelled = await tx.productPlacement.updateMany({
        where: {
          id: data.placementId,
          status: ProductPlacementStatusValues.ACTIVE,
          endsAt: { gt: now },
        },
        data: {
          status: ProductPlacementStatusValues.CANCELLED,
          cancelledAt: now,
          cancelledBy: data.actorId,
          cancelReason: data.reason,
        },
      });
      if (cancelled.count === 1) {
        return tx.productPlacement.findUniqueOrThrow({
          where: { id: data.placementId },
        });
      }

      const placement = await tx.productPlacement.findUnique({
        where: { id: data.placementId },
      });
      if (!placement) {
        throw new NotFoundException('Error.ProductPlacementNotFound');
      }
      if (placement.endsAt <= now) {
        throw new ConflictException('Error.ProductPlacementExpired');
      }
      throw new ConflictException('Error.ProductPlacementNotActive');
    });
  }
}
