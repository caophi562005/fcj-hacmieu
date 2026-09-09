import { BaseConfiguration } from '@common/configurations/base.config';
import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { SqsModule } from '@ssut/nestjs-sqs';
import { MarketingGrpcController } from './controllers/marketing-grpc.controller';
import { ResendMarketingEmailProvider } from './providers/resend-marketing-email.provider';
import { MarketingRepository } from './repositories/marketing.repository';
import { MarketingConsumerService } from './services/marketing-consumer.service';
import { MarketingRecipientService } from './services/marketing-recipient.service';
import { MarketingTemplateService } from './services/marketing-template.service';
import { MarketingService } from './services/marketing.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.IAM_SERVICE)]),
    SqsModule.register({
      producers: [
        {
          name: SqsConfiguration.SEND_MARKETING_EMAIL_QUEUE_NAME,
          queueUrl: SqsConfiguration.SEND_MARKETING_EMAIL_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
      consumers: [
        {
          name: SqsConfiguration.SEND_MARKETING_EMAIL_QUEUE_NAME,
          queueUrl: SqsConfiguration.SEND_MARKETING_EMAIL_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
        {
          name: SqsConfiguration.SCAN_MARKETING_QUEUE_NAME,
          queueUrl: SqsConfiguration.SCAN_MARKETING_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [MarketingGrpcController],
  providers: [
    MarketingRepository,
    MarketingRecipientService,
    MarketingTemplateService,
    ResendMarketingEmailProvider,
    MarketingService,
    MarketingConsumerService,
  ],
})
export class MarketingModule {}
