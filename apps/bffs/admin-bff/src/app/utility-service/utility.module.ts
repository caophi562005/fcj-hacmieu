import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { MediaController } from './controllers/media.controller';
import { NotificationController } from './controllers/notification.controller';
import { ReportController } from './controllers/report.controller';
import { ReviewController } from './controllers/review.controller';
import { MediaService } from './services/media.service';
import { NotificationService } from './services/notification.service';
import { ReportService } from './services/report.service';
import { ReviewService } from './services/review.service';

@Module({
  imports: [
    ClientsModule.register([
      GrpcClientProvider(GrpcService.NOTIFICATION_SERVICE),
      GrpcClientProvider(GrpcService.MEDIA_SERVICE),
    ]),
  ],
  controllers: [
    NotificationController,
    MediaController,
    ReportController,
    ReviewController,
  ],
  providers: [NotificationService, MediaService, ReportService, ReviewService],
})
export class UtilityModule {}
