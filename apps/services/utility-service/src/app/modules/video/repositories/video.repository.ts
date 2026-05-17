import { PaginationConfiguration } from '@common/configurations/pagination.config';
import {
  GetManyVideosRequest,
  UpdateVideoRequest,
  UpdateVideoStatusRequest,
} from '@common/interfaces/models/utility';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/utility-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class VideoRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyVideosRequest) {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

    const where: Prisma.VideoWhereInput = {
      ...(data.shopId && { shopId: data.shopId }),
      ...(data.productId && { productId: data.productId }),
      ...(data.status && { status: data.status as any }),
      deletedAt: null,
    };

    const [videos, totalItems] = await Promise.all([
      this.prismaService.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.video.count({ where }),
    ]);

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      videos,
    };
  }

  findById(id: string) {
    return this.prismaService.video.findUnique({
      where: { id, deletedAt: null },
    });
  }

  create(data: Prisma.VideoCreateInput) {
    return this.prismaService.video.create({ data });
  }

  updateStatus(data: UpdateVideoStatusRequest) {
    return this.prismaService.video.update({
      where: { id: data.id },
      data: {
        status: data.status as any,
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.width !== undefined && { width: data.width }),
        ...(data.height !== undefined && { height: data.height }),
      },
    });
  }

  update(data: UpdateVideoRequest) {
    return this.prismaService.video.update({
      where: { id: data.id },
      data: {
        ...(data.productId !== undefined && { productId: data.productId }),
        ...(data.isHidden !== undefined && { isHidden: data.isHidden }),
      },
    });
  }

  delete(id: string) {
    return this.prismaService.video.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
