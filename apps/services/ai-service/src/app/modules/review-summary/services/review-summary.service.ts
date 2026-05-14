import { groq } from '@ai-sdk/groq';
import {
  REVIEW_SERVICE_NAME,
  ReviewServiceClient,
  UTILITY_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/utility';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { generateText } from 'ai';
import { firstValueFrom } from 'rxjs';
import { ReviewSummaryRepository } from '../repositories/review-summary.repository';

const REVIEW_ANALYSIS_PROMPT = `
Bạn là AI phân tích đánh giá sản phẩm. Nhiệm vụ:
1. Đọc tất cả bình luận bên dưới
2. Trích xuất các ưu điểm (pros) và nhược điểm (cons) được nhắc đến nhiều nhất
3. Viết 1 câu tóm tắt tổng quan

Trả về JSON format:
{
  "pros": ["ưu điểm 1", "ưu điểm 2", ...],
  "cons": ["nhược điểm 1", "nhược điểm 2", ...],
  "summary": "Tóm tắt 1-2 câu"
}

Quy tắc:
- Tối đa 5 pros, 5 cons
- Mỗi item ngắn gọn (< 20 từ)
- Viết bằng tiếng Việt
- Chỉ trả JSON, không thêm text khác
- Nếu không đủ dữ liệu, trả pros/cons rỗng
`;

@Injectable()
export class ReviewSummaryService implements OnModuleInit {
  private readonly logger = new Logger(ReviewSummaryService.name);
  private reviewService!: ReviewServiceClient;

  constructor(
    private readonly repository: ReviewSummaryRepository,
    @Inject(UTILITY_SERVICE_PACKAGE_NAME)
    private readonly utilityClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.reviewService =
      this.utilityClient.getService<ReviewServiceClient>(REVIEW_SERVICE_NAME);
  }

  async getReviewSummary(productId: string) {
    return this.repository.findByProductId(productId);
  }

  async generateReviewSummary(productId: string) {
    // 1. Lấy reviews từ utility-service
    const reviewsResponse = await firstValueFrom(
      this.reviewService.getManyReviews({ productId, page: 1, limit: 100 }),
    );
    const reviews = reviewsResponse.reviews ?? [];

    // 2. Check điều kiện: cần ít nhất 5 reviews
    if (reviews.length < 5) {
      this.logger.log(
        `Product ${productId}: chỉ có ${reviews.length} reviews, skip.`,
      );
      return this.repository.findByProductId(productId);
    }

    // 3. Check cache validity
    const existing = await this.repository.findByProductId(productId);
    if (existing) {
      const daysSinceUpdate =
        (Date.now() - existing.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      const newReviewCount = reviews.length - existing.reviewCount;
      if (daysSinceUpdate < 7 && newReviewCount < 3) {
        this.logger.log(
          `Product ${productId}: cache còn valid (${daysSinceUpdate.toFixed(1)} days, +${newReviewCount} reviews).`,
        );
        return existing;
      }
    }

    // 4. Call AI
    const reviewsText = reviews
      .map((r) => `[${r.rating}⭐] ${r.content || 'Không có nội dung'}`)
      .join('\n');

    try {
      const { text } = await generateText({
        model: groq('moonshotai/kimi-k2-instruct-0905'),
        messages: [
          { role: 'system', content: REVIEW_ANALYSIS_PROMPT },
          { role: 'user', content: reviewsText },
        ],
      });

      const parsed = JSON.parse(text);
      const pros = Array.isArray(parsed.pros) ? parsed.pros.slice(0, 5) : [];
      const cons = Array.isArray(parsed.cons) ? parsed.cons.slice(0, 5) : [];
      const summary = typeof parsed.summary === 'string' ? parsed.summary : '';

      const lastReviewAt = new Date(
        reviews[reviews.length - 1]?.createdAt ?? new Date(),
      );

      // 5. Lưu kết quả
      return this.repository.upsert({
        productId,
        pros,
        cons,
        summary,
        reviewCount: reviews.length,
        lastReviewAt,
      });
    } catch (error) {
      this.logger.error(`AI analysis failed for product ${productId}:`, error);
      return existing ?? null;
    }
  }
}
