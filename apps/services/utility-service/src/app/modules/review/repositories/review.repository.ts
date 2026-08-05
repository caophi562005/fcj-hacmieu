import { PaginationConfiguration } from '@common/configurations/pagination.config';
import { GetReviewByOrderItemIdRequest } from '@common/interfaces/models/utility';
import {
  readStringList,
  writeStringList,
} from '@common/utils/scalar-list.util';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/utility-service';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Đưa `mediaUrls` từ cột JSON về `string[]` để hợp đồng gRPC không đổi.
 *
 * Trên PostgreSQL đây là `String[] @default([])`, nay là cột JSON vì MySQL không
 * có kiểu mảng và cũng không nhận default hằng cho JSON.
 */
function toReviewRow<T extends { id: string; mediaUrls: unknown }>(
  row: T,
): Omit<T, 'mediaUrls'> & { mediaUrls: string[] } {
  return {
    ...row,
    mediaUrls: readStringList(row.mediaUrls, {
      model: 'Review',
      field: 'mediaUrls',
      key: row.id,
    }),
  };
}

@Injectable()
export class ReviewRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: {
    page?: number;
    limit?: number;
    productId?: string;
    sellerId?: string;
    userId?: string;
  }) {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

    const [reviews, totalItems] = await Promise.all([
      this.prismaService.review.findMany({
        where: {
          ...(data.productId && { productId: data.productId }),
          ...(data.sellerId && { sellerId: data.sellerId }),
          ...(data.userId && { userId: data.userId }),
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.review.count({
        where: {
          ...(data.productId && { productId: data.productId }),
          ...(data.sellerId && { sellerId: data.sellerId }),
          ...(data.userId && { userId: data.userId }),
          deletedAt: null,
        },
      }),
    ]);

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      reviews: reviews.map(toReviewRow),
    };
  }

  async findById(data: { id: string }) {
    const row = await this.prismaService.review.findUnique({
      where: {
        id: data.id,
        deletedAt: null,
      },
    });
    return row ? toReviewRow(row) : null;
  }

  async findByOrderItemId(data: GetReviewByOrderItemIdRequest) {
    const row = await this.prismaService.review.findUnique({
      where: {
        userId_orderItemId: {
          userId: data.userId,
          orderItemId: data.orderItemId,
        },
        deletedAt: null,
      },
    });
    return row ? toReviewRow(row) : null;
  }

  async create(data: Prisma.ReviewCreateInput) {
    return toReviewRow(await this.prismaService.review.create({ data }));
  }

  async update(data: {
    id: string;
    userId: string;
    content?: string;
    rating?: number;
    mediaUrls?: string[];
  }) {
    return toReviewRow(
      await this.prismaService.review.update({
        where: { id: data.id },
        data: {
          content: data.content,
          rating: data.rating,
          // Chỉ ghi khi caller cung cấp, để update một phần không xoá mất ảnh cũ.
          mediaUrls:
            data.mediaUrls === undefined
              ? undefined
              : writeStringList(data.mediaUrls),
        },
      }),
    );
  }

  async delete(data: { id: string }, softDelete = true) {
    const row = softDelete
      ? await this.prismaService.review.update({
          where: { id: data.id },
          data: { deletedAt: new Date() },
        })
      : await this.prismaService.review.delete({
          where: { id: data.id },
        });

    return toReviewRow(row);
  }

  async recalculateRatingAggregate(productId: string) {
    const [ratingStats, groupedByRating] = await Promise.all([
      this.prismaService.review.aggregate({
        where: {
          productId,
          deletedAt: null,
        },
        _avg: {
          rating: true,
        },
        _count: {
          _all: true,
        },
      }),
      this.prismaService.review.groupBy({
        by: ['rating'],
        where: {
          productId,
          deletedAt: null,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    let star1Count = 0;
    let star2Count = 0;
    let star3Count = 0;
    let star4Count = 0;
    let star5Count = 0;

    for (const item of groupedByRating) {
      if (item.rating === 1) star1Count = item._count._all;
      if (item.rating === 2) star2Count = item._count._all;
      if (item.rating === 3) star3Count = item._count._all;
      if (item.rating === 4) star4Count = item._count._all;
      if (item.rating === 5) star5Count = item._count._all;
    }

    const totalReviews = ratingStats._count._all;
    const averageRating = ratingStats._avg.rating ?? 0;

    return this.prismaService.ratingAggregate.upsert({
      where: {
        productId,
      },
      create: {
        productId,
        averageRating,
        totalReviews,
        star1Count,
        star2Count,
        star3Count,
        star4Count,
        star5Count,
      },
      update: {
        averageRating,
        totalReviews,
        star1Count,
        star2Count,
        star3Count,
        star4Count,
        star5Count,
      },
    });
  }
}
