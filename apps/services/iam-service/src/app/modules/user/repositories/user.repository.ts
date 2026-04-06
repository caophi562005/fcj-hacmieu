import {
  GetManyUsersRequest,
  GetUserRequest,
} from '@common/interfaces/models/user-access';
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
      phoneNumber: data?.phoneNumber || undefined,
    };
    return this.prismaService.user.findUnique({
      where,
    });
  }

  async list(data: GetManyUsersRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    const where: Prisma.UserWhereInput = {
      firstName: data?.firstName || undefined,
      lastName: data?.lastName || undefined,
      email: data?.email || undefined,
      username: data?.username || undefined,
      phoneNumber: data?.phoneNumber || undefined,
      gender: data?.gender || undefined,
      status: data?.status || undefined,
      roleName: data?.roleName || undefined,
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

  async checkParticipantExists(participantIds: string[]) {
    const userCount = await this.prismaService.user.count({
      where: {
        id: {
          in: participantIds,
        },
      },
    });

    const shopCount = 1;

    return userCount + shopCount;
  }

  async getManyInformationUsers(userIds: string[]) {
    return this.prismaService.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
  }
}
