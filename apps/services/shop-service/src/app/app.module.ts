import { CacheProvider } from '@common/configurations/redis.config';
import { Module } from '@nestjs/common';
import { MerchantModule } from './modules/merchant/merchant.module';
import { ShopModule } from './modules/shop/shop.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [CacheProvider, PrismaModule, MerchantModule, ShopModule],
})
export class AppModule {}
