import { SqsConfiguration } from '@common/configurations/sqs.config';
import { CreatePromotionRedemptionRequest } from '@common/interfaces/models/promotion';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { RedemptionService } from './redemption.service';

type SqsMessage = {
  MessageId?: string;
  Body?: string;
};

@Injectable()
export class RedemptionConsumerService {
  private readonly logger = new Logger(RedemptionConsumerService.name);

  constructor(private readonly redemptionService: RedemptionService) {}

  @SqsMessageHandler(SqsConfiguration.CREATE_REDEMPTION_QUEUE_NAME, false)
  async handleCreateRedemptionMessage(message: SqsMessage) {
    if (!message.Body) {
      this.logger.warn(
        `Skip empty message from ${SqsConfiguration.CREATE_REDEMPTION_QUEUE_NAME}: ${message.MessageId ?? 'unknown-id'}`,
      );
      return;
    }

    const body = JSON.parse(message.Body) as CreatePromotionRedemptionRequest;

    await this.redemptionService.createFromOrder(body);

    this.logger.log(
      `Received message from ${SqsConfiguration.CREATE_REDEMPTION_QUEUE_NAME}: ${message.MessageId ?? 'unknown-id'}`,
    );
  }
}
