import { IncreaseStockRequest } from '@common/interfaces/models/catalog';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/catalog-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SKURepository {
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
}
