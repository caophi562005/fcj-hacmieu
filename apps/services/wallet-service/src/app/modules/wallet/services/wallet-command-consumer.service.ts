import { SqsConfiguration } from '@common/configurations/sqs.config';
import {
  WalletTransactionSourceValues,
  WalletTransactionTypeValues,
} from '@common/constants/wallet.constant';
import { Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsService } from '@ssut/nestjs-sqs';
import { WalletService } from './wallet.service';

type SqsMessage = { Body?: string };

@Injectable()
export class WalletCommandConsumerService {
  constructor(
    private readonly walletService: WalletService,
    private readonly sqsService: SqsService,
  ) {}

  @SqsMessageHandler(SqsConfiguration.WALLET_COMMAND_QUEUE_NAME, false)
  async handle(message: SqsMessage) {
    if (!message.Body) throw new Error('Empty wallet command');
    const envelope = JSON.parse(message.Body) as {
      version: 1;
      eventId: string;
      eventType: 'WALLET_REFUND';
      payload: {
        cancellationId: string;
        processId: string;
        orderId: string;
        userId: string;
        amount: number;
      };
    };
    if (envelope.eventType !== 'WALLET_REFUND') {
      throw new Error(`Unsupported wallet command: ${envelope.eventType}`);
    }
    await this.walletService.adjustWallet({
      processId: envelope.payload.processId,
      userId: envelope.payload.userId,
      type: WalletTransactionTypeValues.CREDIT,
      source: WalletTransactionSourceValues.REFUND,
      referenceId: envelope.payload.orderId,
      amount: envelope.payload.amount,
      description: `Hoàn V-Xu cho đơn hàng ${envelope.payload.orderId}`,
    });
    await this.sqsService.send(SqsConfiguration.CANCELLATION_RESULT_QUEUE_NAME, {
      id: `${envelope.eventId}:result`,
      body: {
        version: 1,
        eventId: `${envelope.eventId}:result`,
        eventType: 'CANCELLATION_EFFECT_COMPLETED',
        payload: {
          cancellationId: envelope.payload.cancellationId,
          effect: 'WALLET',
        },
      },
      delaySeconds: 0,
    });
  }
}
