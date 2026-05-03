import { BaseConfiguration } from '@common/configurations/base.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Global, Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { RedemptionGrpcController } from './controllers/redemption-grpc.controller';
import { RedemptionRepository } from './repositories/redemption.repository';
import { RedemptionConsumerService } from './services/redemption-consumer.service';
import { RedemptionService } from './services/redemption.service';

@Global()
@Module({
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: SqsConfiguration.CREATE_REDEMPTION_QUEUE_NAME,
          queueUrl: SqsConfiguration.CREATE_REDEMPTION_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [RedemptionGrpcController],
  providers: [
    RedemptionRepository,
    RedemptionService,
    RedemptionConsumerService,
  ],
  exports: [RedemptionService],
})
export class RedemptionModule {}
