import {
  GetCategoryRequest,
  GetManyCategoriesRequest,
} from '@common/interfaces/models/catalog';
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

  async list(data: GetManyCategoriesRequest) {
    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
      parentCategoryId: data.parentCategoryId ?? null,
    };

    const [categories, totalItems] = await Promise.all([
      this.prismaService.category.findMany({
        where,
        include: {
          parentCategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prismaService.category.count({ where }),
    ]);

    return {
      totalItems,
      categories,
    };
  }

  async findById(data: GetCategoryRequest) {
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
