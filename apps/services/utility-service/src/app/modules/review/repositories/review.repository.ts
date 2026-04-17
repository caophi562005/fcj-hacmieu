import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/utility-service';
import { PrismaService } from '../../../prisma/prisma.service';

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
    const page = data.page || 1;
    const limit = data.limit || 10;
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
      reviews,
    };
  }

  findById(data: { id: string }) {
    return this.prismaService.review.findFirst({
      where: {
        id: data.id,
        deletedAt: null,
      },
    });
  }

  create(data: Prisma.ReviewCreateInput) {
    return this.prismaService.review.create({
      data,
    });
  }

  update(data: {
    id: string;
    userId: string;
    content?: string;
    rating?: number;
    mediaUrls?: string[];
  }) {
    return this.prismaService.review.update({
      where: { id: data.id },
      data: {
        content: data.content,
        rating: data.rating,
        mediaUrls: data.mediaUrls,
      },
    });
  }

  delete(data: { id: string }, softDelete = true) {
    if (softDelete) {
      return this.prismaService.review.update({
        where: { id: data.id },
        data: { deletedAt: new Date() },
      });
    }
    return this.prismaService.review.delete({
      where: { id: data.id },
    });
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
