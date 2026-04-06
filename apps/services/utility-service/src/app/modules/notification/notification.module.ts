import { Module } from '@nestjs/common';
import { NotificationGrpcController } from './controllers/notification-grpc.controller';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';

@Module({
  controllers: [NotificationGrpcController],
  providers: [NotificationRepository, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
