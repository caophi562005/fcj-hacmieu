import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { CacheProvider } from '@common/configurations/redis.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { GroupValues } from '@common/constants/user.constant';
import { AccessTokenGuard } from '@common/guards/access-token.guard';
import { AuthenticationGuard } from '@common/guards/authentication.guard';
import { SepayHmacGuard } from '@common/guards/sepay-hmac.guard';
import { ExceptionInterceptor } from '@common/interceptors/exception.interceptor';
import { LoggerMiddleware } from '@common/middlewares/logger.middleware';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule } from '@nestjs/microservices';
import { AiModule } from './ai-service/ai.module';
import { CatalogModule } from './catalog-service/catalog.module';
import { IamModule } from './iam-service/iam.module';
import { OrderModule } from './order-service/order.module';
import { PaymentModule } from './payment-service/payment.module';
import { PromotionModule } from './promotion-service/promotion.module';
import { ShopModule } from './shop-service/shop.module';
import { UtilityModule } from './utility-service/utility.module';
import { WalletModule } from './wallet-service/wallet.module';

@Module({
  imports: [
    CacheProvider,
    AiModule,
    IamModule,
    CatalogModule,
    OrderModule,
    PaymentModule,
    PromotionModule,
    ShopModule,
    UtilityModule,
    WalletModule,
    ClientsModule.register([GrpcClientProvider(GrpcService.IAM_SERVICE)]),
  ],
  providers: [
    {
      provide: 'APP_TYPE',
      useValue: GroupValues.ADMIN,
    },
    AccessTokenGuard,
    SepayHmacGuard,
    // {
    //   provide: APP_PIPE,
    //   useClass: CustomZodValidationPipe,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: ExceptionInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
