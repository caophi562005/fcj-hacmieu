import { Module } from '@nestjs/common';
import { ReviewSummaryModule } from './modules/review-summary/review-summary.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, ReviewSummaryModule],
})
export class AppModule {}
