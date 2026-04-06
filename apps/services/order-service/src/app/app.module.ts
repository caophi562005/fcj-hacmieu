import { Module } from '@nestjs/common';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [OrderModule, CartModule],
})
export class AppModule {}
