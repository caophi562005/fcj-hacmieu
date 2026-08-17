import { BaseConfiguration } from '@common/configurations/base.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Global, Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { CreditGrpcController } from './controllers/credit-grpc.controller';
import { SellerSettlementGrpcController } from './controllers/seller-settlement-grpc.controller';
import { CreditRepository } from './repositories/credit.repository';
import { SellerSettlementRepository } from './repositories/seller-settlement.repository';
import { CreditSettlementConsumerService } from './services/credit-settlement-consumer.service';
import { CreditService } from './services/credit.service';
import { SellerSettlementService } from './services/seller-settlement.service';

@Global()
@Module({
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: SqsConfiguration.SETTLE_ORDER_REVENUE_QUEUE_NAME,
          queueUrl: SqsConfiguration.SETTLE_ORDER_REVENUE_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [CreditGrpcController, SellerSettlementGrpcController],
  providers: [
    CreditRepository,
    SellerSettlementRepository,
    CreditService,
    SellerSettlementService,
    CreditSettlementConsumerService,
  ],
  exports: [CreditService],
})
export class CreditModule {}
