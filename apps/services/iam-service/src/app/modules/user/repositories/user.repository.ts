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
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

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
        take,
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
