import {
  CreateNotificationRequest,
  DeleteNotificationRequest,
  GetManyNotificationsRequest,
  GetManyNotificationsResponse,
  GetNotificationRequest,
  NOTIFICATION_SERVICE_NAME,
  NotificationResponse,
  NotificationServiceClient,
  ReadNotificationRequest,
  ReadNotificationResponse,
  UTILITY_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/utility';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationService implements OnModuleInit {
  private notificationModule!: NotificationServiceClient;

  constructor(
    @Inject(UTILITY_SERVICE_PACKAGE_NAME)
    private utilityClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificationModule =
      this.utilityClient.getService<NotificationServiceClient>(
        NOTIFICATION_SERVICE_NAME,
      );
  }

  async getManyNotifications(
    data: GetManyNotificationsRequest,
  ): Promise<GetManyNotificationsResponse> {
    return firstValueFrom(this.notificationModule.getManyNotifications(data));
  }

  async getNotification(
    data: GetNotificationRequest,
  ): Promise<NotificationResponse> {
    return firstValueFrom(this.notificationModule.getNotification(data));
  }

  async createNotification(
    data: CreateNotificationRequest,
  ): Promise<NotificationResponse> {
    return firstValueFrom(this.notificationModule.createNotification(data));
  }

  async readNotification(
    data: ReadNotificationRequest,
  ): Promise<ReadNotificationResponse> {
    return firstValueFrom(this.notificationModule.readNotification(data));
  }

  async deleteNotification(
    data: DeleteNotificationRequest,
  ): Promise<NotificationResponse> {
    return firstValueFrom(this.notificationModule.deleteNotification(data));
  }
}
