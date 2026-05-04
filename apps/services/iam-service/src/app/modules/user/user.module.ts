import { BaseConfiguration } from '@common/configurations/base.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { CacheProvider } from '@common/configurations/redis.config';
import { Global, Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { UserGrpcController } from './controllers/user-grpc.controller';
import { UserRepository } from './repositories/user.repository';
import { UserConsumerService } from './services/user-consumer.service';
import { UserService } from './services/user.service';

@Global()
@Module({
  imports: [
    CacheProvider,
    SqsModule.register({
      consumers: [
        {
          name: SqsConfiguration.CREATE_USER_QUEUE_NAME,
          queueUrl: SqsConfiguration.CREATE_USER_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [UserGrpcController],
  providers: [UserRepository, UserService, UserConsumerService],
  exports: [UserService],
})
export class UserModule {}
