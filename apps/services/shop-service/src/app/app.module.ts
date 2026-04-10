import { Module } from '@nestjs/common';
import { MerchantModule } from './modules/merchant/merchant.module';
import { ShopModule } from './modules/shop/shop.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, MerchantModule, ShopModule],
})
export class AppModule {}
