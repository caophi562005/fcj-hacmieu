import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateNotificationRequest,
  DeleteNotificationRequest,
  GetManyNotificationsRequest,
  GetNotificationRequest,
  ReadNotificationRequest,
} from '@common/interfaces/models/utility';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificationService } from '../services/notification.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class NotificationGrpcController {
  constructor(private readonly notificationService: NotificationService) {}

  @GrpcMethod(GrpcModuleName.UTILITY.NOTIFICATION, 'GetManyNotifications')
  getManyNotifications(data: GetManyNotificationsRequest) {
    return this.notificationService.list(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.NOTIFICATION, 'GetNotification')
  getNotification(data: GetNotificationRequest) {
    return this.notificationService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.NOTIFICATION, 'CreateNotification')
  createNotification(data: CreateNotificationRequest) {
    return this.notificationService.create(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.NOTIFICATION, 'ReadNotification')
  readNotification(data: ReadNotificationRequest) {
    return this.notificationService.read(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.NOTIFICATION, 'DeleteNotification')
  deleteNotification(data: DeleteNotificationRequest) {
    return this.notificationService.delete(data);
  }
}
