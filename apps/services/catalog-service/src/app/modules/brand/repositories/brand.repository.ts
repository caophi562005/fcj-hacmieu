import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/catalog-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BrandRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.BrandCreateInput) {
    return this.prismaService.brand.create({
      data,
    });
  }

  update(data: Prisma.BrandUpdateInput) {
    return this.prismaService.brand.update({
      where: {
        id: data.id as string,
      },
      data,
    });
  }

  delete(data: Prisma.BrandWhereInput, isHard?: boolean) {
    return isHard
      ? this.prismaService.brand.delete({
          where: {
            id: data.id as string,
          },
        })
      : this.prismaService.brand.update({
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

  async list(data: any) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const [brands, totalItems] = await Promise.all([
      this.prismaService.brand.findMany({
        where: {
          deletedAt: null,
          name: data.name ? { contains: data.name } : undefined,
        },
        skip,
        take: limit,
      }),
      this.prismaService.brand.count({
        where: {
          deletedAt: null,
          name: data.name ? { contains: data.name } : undefined,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      brands,
    };
  }

  async findById(data: any) {
    return this.prismaService.brand.findFirst({
      where: {
        id: data.id,
        deletedAt: null,
      },
    });
  }
}
