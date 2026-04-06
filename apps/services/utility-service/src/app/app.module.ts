import { Module } from '@nestjs/common';
import { NotificationModule } from './modules/notification/notification.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, NotificationModule],
})
export class AppModule {}
