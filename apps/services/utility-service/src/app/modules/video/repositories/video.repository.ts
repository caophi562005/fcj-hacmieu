import { PaginationConfiguration } from '@common/configurations/pagination.config';
import {
  GetManyVideosRequest,
  UpdateVideoRequest,
  UpdateVideoStatusRequest,
} from '@common/interfaces/models/utility';
import { shuffle } from '@common/utils/shuffle.util';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/utility-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class VideoRepository {
  /** Chặn trên số bản ghi feed để một request không kéo cả bảng. */
  private static readonly MAX_FEED_LIMIT = 50;

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

  /**
   * Feed video ngẫu nhiên.
   *
   * Trước đây dùng `$queryRawUnsafe` với cú pháp PostgreSQL (`"Video"`,
   * `random()`, `$1`) và nội suy `excludeIds` trực tiếp vào chuỗi SQL — một ID
   * chứa dấu nháy đơn là phá được câu truy vấn.
   *
   * Nay dùng Prisma có kiểu, không còn SQL viết tay: hết phụ thuộc dialect, hết
   * lỗ injection, và `isHidden` trả về boolean thật thay vì 0/1 như raw query.
   *
   * Đánh đổi: hai lượt truy vấn và tải danh sách id đủ điều kiện vào bộ nhớ. Với
   * lượng video hiện tại là chấp nhận được; khi bảng lớn cần đổi sang lấy mẫu
   * theo dải khoá.
   */
  async feed(data: { limit: number; excludeIds?: string[] }) {
    const limit = Math.min(
      Math.max(Math.trunc(data.limit) || 1, 1),
      VideoRepository.MAX_FEED_LIMIT,
    );
    const excludeIds = data.excludeIds?.filter(Boolean) ?? [];

    const where: Prisma.VideoWhereInput = {
      status: 'READY',
      isHidden: false,
      deletedAt: null,
      ...(excludeIds.length > 0 && { id: { notIn: excludeIds } }),
    };

    const candidates = await this.prismaService.video.findMany({
      where,
      select: { id: true },
    });

    if (candidates.length === 0) return [];

    const pickedIds = shuffle(candidates.map((c) => c.id)).slice(0, limit);

    const videos = await this.prismaService.video.findMany({
      where: { id: { in: pickedIds } },
    });

    // findMany không giữ thứ tự của `in`, nên xáo lại để feed thật sự ngẫu nhiên.
    return shuffle(videos);
  }
}
