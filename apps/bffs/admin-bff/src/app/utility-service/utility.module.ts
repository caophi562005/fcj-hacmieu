import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { LocationController } from './controllers/location.controller';
import { MediaController } from './controllers/media.controller';
import { NotificationController } from './controllers/notification.controller';
import { ReportController } from './controllers/report.controller';
import { ReviewController } from './controllers/review.controller';
import { VideoController } from './controllers/video.controller';
import { LocationService } from './services/location.service';
import { MediaService } from './services/media.service';
import { NotificationService } from './services/notification.service';
import { ReportService } from './services/report.service';
import { ReviewService } from './services/review.service';
import { VideoService } from './services/video.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.UTILITY_SERVICE)]),
  ],
  controllers: [
    NotificationController,
    LocationController,
    MediaController,
    ReportController,
    ReviewController,
    VideoController,
  ],
  providers: [
    NotificationService,
    LocationService,
    MediaService,
    ReportService,
    ReviewService,
    VideoService,
  ],
})
export class UtilityModule {}
