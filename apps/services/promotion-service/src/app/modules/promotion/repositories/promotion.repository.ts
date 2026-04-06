import { PromotionStatusValues } from '@common/constants/promotion.constant';
import {
  CheckPromotionRequest,
  GetManyPromotionsRequest,
  GetPromotionRequest,
} from '@common/interfaces/models/promotion';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma-client/promotion-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PromotionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyPromotionsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    const whereClause: Prisma.PromotionWhereInput = {
      code: data?.code
        ? { contains: data.code, mode: 'insensitive' }
        : undefined,
      name: data?.name
        ? { contains: data.name, mode: 'insensitive' }
        : undefined,
      status: data?.status || undefined,
      startsAt: data?.startsAt ? { lte: data.startsAt } : undefined,
      endsAt: data?.endsAt ? { gte: data.endsAt } : undefined,
      scope: data?.scope || undefined,
      discountType: data?.discountType || undefined,
    };

    // Nếu includeUsed = false và có userId, chỉ lấy những promotion chưa sử dụng
    if (data.includeUsed === false && data.userId) {
      whereClause.redemptions = {
        none: {
          userId: data.userId,
          usedAt: { not: null },
        },
      };
    }

    const [totalItems, promotions] = await Promise.all([
      this.prismaService.promotion.count({
        where: whereClause,
      }),
      this.prismaService.promotion.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          code: true,
          name: true,
          startsAt: true,
          endsAt: true,
          status: true,
          scope: true,
          discountType: true,
          totalLimit: true,
        },
      }),
    ]);
    return {
      promotions,
      totalItems,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  findById(data: GetPromotionRequest) {
    return this.prismaService.promotion.findUnique({
      where: {
        id: data?.id || undefined,
        code: data?.code || undefined,
      },
    });
  }

  create(data: Prisma.PromotionCreateInput) {
    return this.prismaService.promotion.create({
      data,
    });
  }

  update(data: Prisma.PromotionUpdateInput) {
    return this.prismaService.promotion.update({
      where: {
        id: data.id as string,
      },
      data,
    });
  }

  delete(data: Prisma.PromotionWhereInput, isHard?: boolean) {
    return isHard
      ? this.prismaService.promotion.delete({
          where: {
            id: data.id as string,
          },
        })
      : this.prismaService.promotion.update({
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

  async check(data: CheckPromotionRequest) {
    // Check promotion có tồn tại không
    const promotion = await this.prismaService.promotion.findUnique({
      where: {
        code: data.code,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Error.PromotionNotFound');
    }

    // Check promotion đã được sử dụng chưa
    const redemption = await this.prismaService.redemption.findUnique({
      where: {
        code_userId: {
          code: data.code,
          userId: data.userId,
        },
      },
    });

    if (redemption && redemption.usedAt !== null) {
      throw new BadRequestException('Error.PromotionAlreadyUsing');
    }

    // Check promotion có hoạt động không
    if (promotion.status !== PromotionStatusValues.ACTIVE) {
      throw new BadRequestException('Error.PromotionInactive');
    }

    // Check thời gian áp dụng khuyến mãi
    const now = new Date();
    if (promotion.startsAt > now || promotion.endsAt < now) {
      throw new BadRequestException('Error.PromotionNotInValidTime');
    }

    return promotion;
  }
}
