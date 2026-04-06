import { Module } from '@nestjs/common';
import { PromotionModule } from './modules/promotion/promotion.module';
import { RedemptionModule } from './modules/redemption/redemption.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, PromotionModule, RedemptionModule],
})
export class AppModule {}
