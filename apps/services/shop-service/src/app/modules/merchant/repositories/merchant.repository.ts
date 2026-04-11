import {
  CreateMerchantRequest,
  GetManyMerchantsRequest,
  GetMerchantRequest,
  UpdateMerchantRequest,
} from '@common/interfaces/models/shop';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/shop-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MerchantRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyMerchantsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    const where: Prisma.MerchantWhereInput = {
      deletedAt: null,
      ...(data.userId ? { userId: data.userId } : {}),
      ...(data.legalName
        ? {
            legalName: {
              contains: data.legalName,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(data.type ? { type: data.type } : {}),
      ...(data.approvalStatus ? { approvalStatus: data.approvalStatus } : {}),
      ...(typeof data.canSell === 'boolean' ? { canSell: data.canSell } : {}),
    };

    const [totalItems, merchants] = await Promise.all([
      this.prismaService.merchant.count({
        where,
      }),
      this.prismaService.merchant.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      merchants,
      totalItems,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  findById(data: GetMerchantRequest) {
    return this.prismaService.merchant.findFirst({
      where: {
        id: data.id,
        deletedAt: null,
      },
    });
  }

  create(data: CreateMerchantRequest) {
    return this.prismaService.merchant.create({
      data,
    });
  }

  update(data: UpdateMerchantRequest) {
    const { id, ...updateData } = data;
    return this.prismaService.merchant.update({
      where: {
        id,
      },
      data: updateData,
    });
  }

  delete(data: Prisma.MerchantWhereInput, isHard?: boolean) {
    const id = data.id as string;
    const deletedAt = new Date();

    return this.prismaService.$transaction(async (tx) => {
      if (isHard) {
        await tx.shop.deleteMany({
          where: {
            merchantId: id,
          },
        });

        return tx.merchant.delete({
          where: {
            id,
          },
        });
      }

      await tx.shop.updateMany({
        where: {
          merchantId: id,
          deletedAt: null,
        },
        data: {
          deletedAt,
          deletedById: data.deletedById as string,
        },
      });

      return tx.merchant.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt,
          deletedById: data.deletedById as string,
        },
      });
    });
  }
}
