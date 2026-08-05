import {
  readStringList,
  writeStringList,
} from '@common/utils/scalar-list.util';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/** Hình dạng ReviewSummary mà tầng trên dùng: pros/cons luôn là string[]. */
export interface ReviewSummaryRow {
  id: string;
  productId: string;
  pros: string[];
  cons: string[];
  summary: string;
  reviewCount: number;
  lastReviewAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ReviewSummaryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * `pros` và `cons` là cột JSON trên MySQL nên Prisma trả `JsonValue`.
   * Map tại một chỗ để mọi đường đọc đều ra `string[]`, giữ nguyên hợp đồng gRPC.
   */
  private toRow(row: {
    id: string;
    productId: string;
    pros: unknown;
    cons: unknown;
    summary: string;
    reviewCount: number;
    lastReviewAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): ReviewSummaryRow {
    return {
      ...row,
      pros: readStringList(row.pros, {
        model: 'ReviewSummary',
        field: 'pros',
        key: row.productId,
      }),
      cons: readStringList(row.cons, {
        model: 'ReviewSummary',
        field: 'cons',
        key: row.productId,
      }),
    };
  }

  async findByProductId(productId: string): Promise<ReviewSummaryRow | null> {
    const row = await this.prismaService.reviewSummary.findUnique({
      where: { productId },
    });
    return row ? this.toRow(row) : null;
  }

  async upsert(data: {
    productId: string;
    pros: string[];
    cons: string[];
    summary: string;
    reviewCount: number;
    lastReviewAt: Date;
  }): Promise<ReviewSummaryRow> {
    const pros = writeStringList(data.pros);
    const cons = writeStringList(data.cons);

    const row = await this.prismaService.reviewSummary.upsert({
      where: { productId: data.productId },
      update: {
        pros,
        cons,
        summary: data.summary,
        reviewCount: data.reviewCount,
        lastReviewAt: data.lastReviewAt,
      },
      create: { ...data, pros, cons },
    });

    return this.toRow(row);
  }
}
