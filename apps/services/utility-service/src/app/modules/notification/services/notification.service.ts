import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateNotificationRequest,
  DeleteNotificationRequest,
  NotificationResponse,
  ReadNotificationRequest,
} from '@common/interfaces/models/notification';
import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async create({
    processId,
    ...data
  }: CreateNotificationRequest): Promise<NotificationResponse> {
    const createdNotification = await this.notificationRepository.create(data);
    // this.kafkaService.emit(
    //   QueueTopics.NOTIFICATION.CREATE_NOTIFICATION,
    //   createdNotification
    // );
    const unreadCount = await this.notificationRepository.getUnreadCount(
      data.userId,
    );
    // await this.redisService.publish(
    //   RedisChannel.NOTIFICATION_CHANNEL,
    //   JSON.stringify({ unreadCount, userId: data.userId })
    // );
    return createdNotification;
  }

  async read({
    processId,
    ...data
  }: ReadNotificationRequest): Promise<NotificationResponse> {
    try {
      const readNotification = await this.notificationRepository.read(data);
      // this.kafkaService.emit(
      //   QueueTopics.NOTIFICATION.READ_NOTIFICATION,
      //   readNotification
      // );
      return readNotification;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.NotificationNotFound');
      }
      throw error;
    }
  }

  async delete(data: DeleteNotificationRequest): Promise<NotificationResponse> {
    try {
      const deletedNotification = await this.notificationRepository.delete(
        data,
        false,
      );
      // this.kafkaService.emit(
      //   QueueTopics.NOTIFICATION.DELETE_NOTIFICATION,
      //   deletedNotification
      // );
      return deletedNotification;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.NotificationNotFound');
      }
      throw error;
    }
  }
}
