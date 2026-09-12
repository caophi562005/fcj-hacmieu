import { Global, Module } from '@nestjs/common';
import { PlatformLedgerGrpcController } from './controllers/platform-ledger-grpc.controller';
import { WalletGrpcController } from './controllers/wallet-grpc.controller';
import { PlatformLedgerRepository } from './repositories/platform-ledger.repository';
import { WalletRepository } from './repositories/wallet.repository';
import { PlatformLedgerService } from './services/platform-ledger.service';
import { WalletService } from './services/wallet.service';
import { WalletCommandConsumerService } from './services/wallet-command-consumer.service';
import { BaseConfiguration } from '@common/configurations/base.config';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { SqsModule } from '@ssut/nestjs-sqs';

@Global()
@Module({
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: SqsConfiguration.WALLET_COMMAND_QUEUE_NAME,
          queueUrl: SqsConfiguration.WALLET_COMMAND_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
      producers: [
        {
          name: SqsConfiguration.CANCELLATION_RESULT_QUEUE_NAME,
          queueUrl: SqsConfiguration.CANCELLATION_RESULT_QUEUE_URL,
          region: BaseConfiguration.AWS_REGION,
        },
      ],
    }),
  ],
  controllers: [WalletGrpcController, PlatformLedgerGrpcController],
  providers: [
    WalletRepository,
    WalletService,
    PlatformLedgerRepository,
    PlatformLedgerService,
    WalletCommandConsumerService,
  ],
  exports: [WalletService, PlatformLedgerService],
})
export class WalletModule {}
