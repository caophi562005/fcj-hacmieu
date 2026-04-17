import {
  GetManyNotificationsRequest,
  GetNotificationRequest,
  ReadNotificationRequest,
} from '@common/interfaces/models/utility';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/utility-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyNotificationsRequest) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const [notifications, totalItems] = await Promise.all([
      this.prismaService.notification.findMany({
        where: {
          userId: data.userId,
          type: data.type,
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.notification.count({
        where: {
          userId: data.userId,
          type: data.type,
          deletedAt: null,
        },
      }),
    ]);

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      notifications,
    };
  }

  findById(data: GetNotificationRequest) {
    return this.prismaService.notification.findFirst({
      where: {
        id: data.id,
        userId: data.userId,
        deletedAt: null,
      },
    });
  }

  getUnreadCount(userId: string) {
    return this.prismaService.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  create(data: Prisma.NotificationCreateInput) {
    return this.prismaService.notification.create({
      data,
    });
  }

  async read(data: ReadNotificationRequest) {
    const where: Prisma.NotificationWhereInput = {
      id: {
        in: data.id,
      },
      deletedAt: null,
    };

    if (data.updatedById) {
      where.userId = data.updatedById;
    }

    return this.prismaService.notification.updateMany({
      where,
      data: {
        updatedById: data.updatedById,
        isRead: true,
      },
    });
  }

  delete(data: Prisma.NotificationWhereInput, isHard?: boolean) {
    return isHard
      ? this.prismaService.notification.delete({
          where: {
            id: data.id as string,
          },
        })
      : this.prismaService.notification.update({
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
}
