import { PaginationConfiguration } from '@common/configurations/pagination.config';
import { GetManyAttributesRequest } from '@common/interfaces/models/catalog';
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

  async list(data: GetManyAttributesRequest) {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

    const [attributes, totalItems] = await Promise.all([
      this.prismaService.attribute.findMany({
        where: {
          deletedAt: null,
          name: data.name ? { contains: data.name } : undefined,
        },
        skip,
        take: limit,
      }),
      this.prismaService.attribute.count({
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
      attributes,
    };
  }

  async findById(data: any) {
    return this.prismaService.attribute.findFirst({
      where: {
        id: data.id,
        deletedAt: null,
      },
    });
  }
}
