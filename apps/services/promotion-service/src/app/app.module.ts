import { Module } from '@nestjs/common';
import { MarketingModule } from './modules/marketing/marketing.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { RedemptionModule } from './modules/redemption/redemption.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, PromotionModule, RedemptionModule, MarketingModule],
})
export class AppModule {}
