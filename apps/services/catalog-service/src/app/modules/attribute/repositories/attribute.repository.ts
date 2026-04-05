import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/catalog-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AttributeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.AttributeCreateInput) {
    return this.prismaService.attribute.create({
      data,
    });
  }

  update(data: Prisma.AttributeUpdateInput) {
    return this.prismaService.attribute.update({
      where: {
        id: data.id as string,
      },
      data,
    });
  }

  delete(data: Prisma.AttributeWhereInput, isHard?: boolean) {
    return isHard
      ? this.prismaService.attribute.delete({
          where: {
            id: data.id as string,
          },
        })
      : this.prismaService.attribute.update({
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
