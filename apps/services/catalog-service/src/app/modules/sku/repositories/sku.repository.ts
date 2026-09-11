import { isDatabaseDemoActive } from '@common/configurations/database-demo.config';
import { IncreaseStockRequest } from '@common/interfaces/models/catalog';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/catalog-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SKURepository {
  private deadlockDemoSequence = 0;

  constructor(private readonly prismaService: PrismaService) {}

  updateProduct(data: { id: string; soldCount: number }) {
    return this.prismaService.product.update({
      where: {
        id: data.id,
      },
      data: {
        soldCount: {
          increment: data.soldCount,
        },
      },
      include: {
        skus: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            value: true,
            price: true,
            stock: true,
            image: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            logo: true,
            parentCategory: true,
          },
        },
      },
    });
  }

  async findById(data: Prisma.SKUWhereUniqueInput) {
    if (isDatabaseDemoActive('5.3')) {
      // DEMO LỖI 5.3 - NON-REPEATABLE READ:
      // Đổi giá SKU từ request/session khác trong 0 giây giữa hai lần đọc.
      return this.prismaService.$transaction(
        async (tx) => {
          const firstRead = await tx.sKU.findUnique({
            where: { id: data.id, deletedAt: null },
            include: { product: true },
          });
          await tx.$queryRaw(Prisma.sql`SELECT SLEEP(0)`);
          const secondRead = await tx.sKU.findUnique({
            where: { id: data.id, deletedAt: null },
            include: { product: true },
          });
          console.log('[DEMO 5.3] Giá đọc lần 1/lần 2:', {
            firstPrice: firstRead?.price,
            secondPrice: secondRead?.price,
          });
          return secondRead;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
          timeout: 20_000,
        },
      );
    }

    // BẢN ĐÚNG 5.3. Luồng thường không giữ transaction 10 giây.
    return this.prismaService.sKU.findUnique({
      where: { id: data.id, deletedAt: null },
      include: { product: true },
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

  async increaseStock(data: IncreaseStockRequest) {
    if (data.items.length === 0) return;

    if (isDatabaseDemoActive('5.5')) {
      // DEMO LỖI 5.5 - DEADLOCK:
      // Hai request liên tiếp được ép khóa SKU theo thứ tự ngược nhau để thao tác
      // hủy đồng thời trên hai tab tạo vòng chờ một cách ổn định.
      const sequence = this.deadlockDemoSequence++;
      const demoItems = [...data.items].sort((left, right) =>
        left.skuId.localeCompare(right.skuId),
      );
      if (sequence % 2 === 1) demoItems.reverse();
      const demoProductQuantities = new Map<string, number>();
      for (const item of demoItems) {
        demoProductQuantities.set(
          item.productId,
          (demoProductQuantities.get(item.productId) ?? 0) + item.quantity,
        );
      }

      console.log('[DEMO 5.5] Hoàn kho theo thứ tự:', {
        orderId: data.orderId,
        direction: sequence % 2 === 0 ? 'ASC' : 'DESC',
        skuIds: demoItems.map((item) => item.skuId),
      });

      await this.prismaService.$transaction(
        async (tx) => {
          for (let index = 0; index < demoItems.length; index++) {
            const item = demoItems[index];
            await tx.sKU.update({
              where: { id: item.skuId },
              data: { stock: { increment: item.quantity } },
            });
            if (index === 0) {
              await tx.$queryRaw(Prisma.sql`SELECT SLEEP(10)`);
            }
          }
          for (const [productId, quantity] of [...demoProductQuantities].sort(
            ([left], [right]) => left.localeCompare(right),
          )) {
            await tx.product.update({
              where: { id: productId },
              data: { soldCount: { decrement: quantity } },
            });
          }
        },
        { timeout: 20_000 },
      );
      return;
    }

    // BẢN ĐÚNG 5.5
    const sortedItems = [...data.items].sort((left, right) =>
      left.skuId.localeCompare(right.skuId),
    );
    const skuIds = [...new Set(sortedItems.map((item) => item.skuId))];
    const productQuantities = new Map<string, number>();
    for (const item of sortedItems) {
      productQuantities.set(
        item.productId,
        (productQuantities.get(item.productId) ?? 0) + item.quantity,
      );
    }
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.prismaService.$transaction(async (tx) => {
          await tx.$queryRaw<Array<{ id: string }>>`
            SELECT id
            FROM SKU
            WHERE id IN (${Prisma.join(skuIds)})
            ORDER BY id
            FOR UPDATE
          `;
          for (const item of sortedItems) {
            await tx.sKU.update({
              where: { id: item.skuId },
              data: { stock: { increment: item.quantity } },
            });
          }
          for (const [productId, quantity] of [...productQuantities].sort(
            ([left], [right]) => left.localeCompare(right),
          )) {
            await tx.product.update({
              where: { id: productId },
              data: { soldCount: { decrement: quantity } },
            });
          }
        });
        return;
      } catch (error) {
        const isRetryableWriteConflict =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034';
        if (!isRetryableWriteConflict || attempt === maxAttempts) throw error;
      }
    }
  }
}
