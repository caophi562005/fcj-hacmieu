import { Module } from '@nestjs/common';
import { MediaModule } from './modules/media/image.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ReportModule } from './modules/report/report.module';
import { ReviewModule } from './modules/review/review.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    NotificationModule,
    MediaModule,
    ReportModule,
    ReviewModule,
  ],
})
export class AppModule {}
