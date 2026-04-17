import { SqsConfiguration } from '@common/configurations/sqs.config';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateNotificationRequest,
  DeleteNotificationRequest,
  GetManyNotificationsRequest,
  GetManyNotificationsResponse,
  GetNotificationRequest,
  GetNotificationResponse,
  NotificationResponse,
  ReadNotificationRequest,
  ReadNotificationResponse,
} from '@common/interfaces/models/utility';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { v4 as uuidv4 } from 'uuid';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly sqsService: SqsService,
  ) {}

  private async sendQueueMessage<T>(queueName: string, body: T) {
    try {
      await this.sqsService.send(queueName, {
        id: uuidv4(),
        body,
        delaySeconds: 0,
      });
    } catch (error) {
      console.error(`Error sending message to ${queueName}:`, error);
      throw new InternalServerErrorException(
        'Error.SendNotificationMessageFailed',
      );
    }
  }

  async list({
    processId,
    ...data
  }: GetManyNotificationsRequest): Promise<GetManyNotificationsResponse> {
    return this.notificationRepository.list(data);
  }

  async findById({
    processId,
    ...data
  }: GetNotificationRequest): Promise<GetNotificationResponse> {
    const notification = await this.notificationRepository.findById(data);

    if (!notification) {
      throw new NotFoundException('Error.NotificationNotFound');
    }

    return notification;
  }

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

    await this.sendQueueMessage(SqsConfiguration.SEND_NOTIFICATION_QUEUE_NAME, {
      ...createdNotification,
      unreadCount,
    });

    // await this.redisService.publish(
    //   RedisChannel.NOTIFICATION_CHANNEL,
    //   JSON.stringify({ unreadCount, userId: data.userId })
    // );
    return createdNotification;
  }

  async read({
    processId,
    ...data
  }: ReadNotificationRequest): Promise<ReadNotificationResponse> {
    const result = await this.notificationRepository.read(data);

    if (result.count === 0) {
      throw new NotFoundException('Error.NotificationNotFound');
    }

    // this.kafkaService.emit(
    //   QueueTopics.NOTIFICATION.READ_NOTIFICATION,
    //   result
    // );

    return {
      count: result.count,
    };
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
