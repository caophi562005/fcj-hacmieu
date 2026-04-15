import { Module } from '@nestjs/common';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, OrderModule, CartModule],
})
export class AppModule {}
