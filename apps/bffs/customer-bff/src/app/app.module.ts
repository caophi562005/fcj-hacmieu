import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { CacheProvider } from '@common/configurations/redis.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { AccessTokenGuard } from '@common/guards/access-token.guard';
import { AuthenticationGuard } from '@common/guards/authentication.guard';
import { PaymentAPIKeyGuard } from '@common/guards/payment-api-key.guard';
import { ExceptionInterceptor } from '@common/interceptors/exception.interceptor';
import { LoggerMiddleware } from '@common/middlewares/logger.middleware';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule } from '@nestjs/microservices';
import { IamModule } from './iam-service/iam.module';

@Module({
  imports: [
    CacheProvider,
    IamModule,
    ClientsModule.register([GrpcClientProvider(GrpcService.IAM_SERVICE)]),
  ],
  providers: [
    AccessTokenGuard,
    PaymentAPIKeyGuard,
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
