import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReviewSummaryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByProductId(productId: string) {
    return this.prismaService.reviewSummary.findUnique({
      where: { productId },
    });
  }

  async upsert(data: {
    productId: string;
    pros: string[];
    cons: string[];
    summary: string;
    reviewCount: number;
    lastReviewAt: Date;
  }) {
    return this.prismaService.reviewSummary.upsert({
      where: { productId: data.productId },
      update: {
        pros: data.pros,
        cons: data.cons,
        summary: data.summary,
        reviewCount: data.reviewCount,
        lastReviewAt: data.lastReviewAt,
      },
      create: data,
    });
  }
}
