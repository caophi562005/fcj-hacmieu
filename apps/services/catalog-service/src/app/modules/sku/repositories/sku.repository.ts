import { IncreaseStockRequest } from '@common/interfaces/models/catalog';
import { Injectable } from '@nestjs/common';
import {
  InventoryReservationStatus,
  Prisma,
} from '../../../../generated/prisma-client/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SKURepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(data: Prisma.SKUWhereUniqueInput) {
    return this.prismaService.sKU.findUnique({
      where: {
        id: data.id,
        deletedAt: null,
      },
      include: {
        product: true,
      },
    });
  }

  decreaseStock(data: { productId: string; value: string; quantity: number }) {
    return this.prismaService.sKU.update({
      where: {
        productId_value: {
          productId: data.productId,
          value: data.value,
        },
      },
      data: {
        stock: {
          decrement: data.quantity,
        },
      },
    });
  }

  increaseStock(data: IncreaseStockRequest) {
    return this.prismaService.$transaction(async (tx) => {
      await Promise.all(
        data.items.map(async (item) => {
          await tx.sKU.update({
            where: {
              id: item.skuId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }),
      );
    });
  }

  async reserve(data: {
    orderId: string;
    userId: string;
    items: Array<{ skuId: string; quantity: number }>;
  }) {
    const items = Array.from(
      data.items.reduce((map, item) => {
        map.set(item.skuId, (map.get(item.skuId) ?? 0) + item.quantity);
        return map;
      }, new Map<string, number>()),
      ([skuId, quantity]) => ({ skuId, quantity }),
    );
    if (items.length === 0 || items.some((item) => item.quantity <= 0)) {
      throw new Error('Invalid inventory reservation items');
    }

    return this.withSerializableRetry(async (tx) => {
      const existing = await tx.inventoryReservation.findUnique({
        where: { orderId: data.orderId },
      });
      if (existing) return existing;

      for (const item of items) {
        const changed = await tx.sKU.updateMany({
          where: {
            id: item.skuId,
            deletedAt: null,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (changed.count !== 1) {
          throw new Error(`INSUFFICIENT_OR_INVALID_STOCK:${item.skuId}`);
        }
      }
      return tx.inventoryReservation.create({
        data: {
          orderId: data.orderId,
          userId: data.userId,
          status: InventoryReservationStatus.RESERVED,
          items: { create: items },
        },
      });
    });
  }

  async release(data: {
    orderId: string;
    userId: string;
    items: Array<{ skuId: string; quantity: number }>;
  }) {
    return this.withSerializableRetry(async (tx) => {
      const existing = await tx.inventoryReservation.findUnique({
        where: { orderId: data.orderId },
        include: { items: true },
      });
      if (!existing) {
        return tx.inventoryReservation.create({
          data: {
            orderId: data.orderId,
            userId: data.userId,
            status: InventoryReservationStatus.CANCELLED_BEFORE_RESERVE,
            items: {
              create: data.items.map((item) => ({
                skuId: item.skuId,
                quantity: item.quantity,
              })),
            },
          },
        });
      }
      if (existing.status !== InventoryReservationStatus.RESERVED) {
        return existing;
      }

      const changed = await tx.inventoryReservation.updateMany({
        where: {
          id: existing.id,
          status: InventoryReservationStatus.RESERVED,
        },
        data: { status: InventoryReservationStatus.RELEASED },
      });
      if (changed.count !== 1) throw new Error('INVENTORY_RELEASE_CONFLICT');
      for (const item of existing.items) {
        await tx.sKU.update({
          where: { id: item.skuId },
          data: { stock: { increment: item.quantity } },
        });
      }
      return tx.inventoryReservation.findUniqueOrThrow({
        where: { id: existing.id },
      });
    });
  }

  private async withSerializableRetry<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        return await this.prismaService.$transaction(operation, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error: unknown) {
        const code =
          typeof error === 'object' && error !== null && 'code' in error
            ? String(error.code)
            : undefined;
        if ((code === 'P2002' || code === 'P2034') && attempt < 3) continue;
        throw error;
      }
    }
    throw new Error('Inventory transaction retry limit exceeded');
  }
}
