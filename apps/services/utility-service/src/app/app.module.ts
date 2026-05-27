import { CacheProvider } from '@common/configurations/redis.config';
import { Module } from '@nestjs/common';
import { LocationModule } from './modules/location/location.module';
import { MediaModule } from './modules/media/image.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ReportModule } from './modules/report/report.module';
import { ReviewModule } from './modules/review/review.module';
import { VideoModule } from './modules/video/video.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    CacheProvider,
    PrismaModule,
    NotificationModule,
    MediaModule,
    VideoModule,
    ReportModule,
    ReviewModule,
    LocationModule,
  ],
})
export class AppModule {}
