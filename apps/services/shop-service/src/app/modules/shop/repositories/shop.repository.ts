import {
  CreateShopRequest,
  GetManyShopsRequest,
  GetShopRequest,
  UpdateShopRequest,
} from '@common/interfaces/models/shop';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/shop-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ShopRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyShopsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    const where: Prisma.ShopWhereInput = {
      deletedAt: null,
      ...(data.merchantId ? { merchantId: data.merchantId } : {}),
      ...(data.name
        ? {
            name: {
              contains: data.name,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(data.status ? { status: data.status } : {}),
    };

    const [totalItems, shops] = await Promise.all([
      this.prismaService.shop.count({
        where,
      }),
      this.prismaService.shop.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      shops,
      totalItems,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  findById(data: GetShopRequest) {
    return this.prismaService.shop.findFirst({
      where: {
        id: data.id,
        deletedAt: null,
      },
    });
  }

  create({ merchantId, ...data }: CreateShopRequest) {
    return this.prismaService.shop.create({
      data: {
        ...data,
        merchant: {
          connect: { id: merchantId },
        },
      },
    });
  }

  update({ id, merchantId, ...data }: UpdateShopRequest) {
    return this.prismaService.shop.update({
      where: {
        id,
      },
      data: {
        ...data,
        ...(merchantId
          ? {
              merchant: {
                connect: {
                  id: merchantId,
                },
              },
            }
          : {}),
      },
    });
  }

  delete(data: Prisma.ShopWhereInput, isHard?: boolean) {
    return isHard
      ? this.prismaService.shop.delete({
          where: {
            id: data.id as string,
          },
        })
      : this.prismaService.shop.update({
          where: {
            id: data.id as string,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById: data.deletedById as string,
          },
        });
  }
}
