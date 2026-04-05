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
}
