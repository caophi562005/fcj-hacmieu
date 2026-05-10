import { PaginationConfiguration } from '@common/configurations/pagination.config';
import {
  GetManyUsersRequest,
  GetUserRequest,
} from '@common/interfaces/models/iam';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/iam-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async find(data: GetUserRequest) {
    const where: Prisma.UserWhereUniqueInput = {
      id: data?.id || undefined,
      email: data?.email || undefined,
      username: data?.username || undefined,
    };
    return this.prismaService.user.findUnique({
      where,
    });
  }

  async list(data: GetManyUsersRequest) {
    const page = data.page || PaginationConfiguration.DEFAULT_PAGE_PAGINATION;
    const limit =
      data.limit || PaginationConfiguration.DEFAULT_LIMIT_PAGINATION;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      email: data?.email || undefined,
      username: data?.username || undefined,
      gender: data?.gender || undefined,
      status: data?.status || undefined,
      group: data?.group?.length
        ? {
            hasSome: data.group,
          }
        : undefined,
    };

    const [totalItems, users] = await Promise.all([
      this.prismaService.user.count({
        where,
      }),
      this.prismaService.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      users,
      totalItems,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  create(data: Prisma.UserCreateInput) {
    return this.prismaService.user.create({
      data,
    });
  }

  update(data: Prisma.UserUpdateInput) {
    return this.prismaService.user.update({
      where: { id: data.id as string },
      data,
    });
  }
}
