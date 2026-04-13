import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma-client/catalog-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.CategoryCreateInput) {
    return this.prismaService.category.create({
      data,
      include: {
        parentCategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  update(data: Prisma.CategoryUpdateInput) {
    return this.prismaService.category.update({
      where: {
        id: data.id as string,
      },
      data,
      include: {
        parentCategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  delete(data: Prisma.CategoryWhereInput, isHard?: boolean): Promise<Category> {
    return isHard
      ? this.prismaService.category.delete({
          where: {
            id: data.id as string,
          },
        })
      : this.prismaService.category.update({
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

    const [categories, totalItems] = await Promise.all([
      this.prismaService.category.findMany({
        where: {
          deletedAt: null,
          name: data.name ? { contains: data.name } : undefined,
        },
        skip,
        take: limit,
        include: {
          parentCategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prismaService.category.count({
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
      categories,
    };
  }

  async findById(data: any) {
    return this.prismaService.category.findFirst({
      where: {
        id: data.id,
        deletedAt: null,
      },
      include: {
        parentCategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
