import {
  AdjustShopCreditRequest,
  AdjustShopCreditRequestSchema,
} from '@common/interfaces/models/wallet';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { SqsConfiguration } from '@common/configurations/sqs.config';
import { CreditService } from './credit.service';

type SqsMessage = {
  MessageId?: string;
  Body?: string;
};

@Injectable()
export class CreditSettlementConsumerService {
  private readonly logger = new Logger(CreditSettlementConsumerService.name);

  constructor(private readonly creditService: CreditService) {}

  @SqsMessageHandler(SqsConfiguration.SETTLE_ORDER_REVENUE_QUEUE_NAME, false)
  async handleSettlementMessage(message: SqsMessage) {
    if (!message.Body) {
      this.logger.warn(
        `Skip empty message from ${SqsConfiguration.SETTLE_ORDER_REVENUE_QUEUE_NAME}: ${message.MessageId ?? 'unknown-id'}`,
      );
      return;
    }

    const body = AdjustShopCreditRequestSchema.parse(
      JSON.parse(message.Body),
    ) as AdjustShopCreditRequest;

    await this.creditService.adjustShopCredit(body);

    this.logger.log(
      `Received message from ${SqsConfiguration.SETTLE_ORDER_REVENUE_QUEUE_NAME}: ${message.MessageId ?? 'unknown-id'}`,
    );
  }
}
