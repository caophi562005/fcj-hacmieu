import { SqsConfiguration } from '@common/configurations/sqs.config';
import { CreatePromotionRedemptionRequest } from '@common/interfaces/models/promotion';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { SqsService } from '@ssut/nestjs-sqs';
import { RedemptionRepository } from '../repositories/redemption.repository';
import { RedemptionService } from './redemption.service';

type SqsMessage = {
  MessageId?: string;
  Body?: string;
};

@Injectable()
export class RedemptionConsumerService {
  private readonly logger = new Logger(RedemptionConsumerService.name);

  constructor(
    private readonly redemptionService: RedemptionService,
    private readonly redemptionRepository: RedemptionRepository,
    private readonly sqsService: SqsService,
  ) {}

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

  @SqsMessageHandler(SqsConfiguration.PROMOTION_COMMAND_QUEUE_NAME, false)
  async handlePromotionCommand(message: SqsMessage) {
    if (!message.Body) throw new Error('Empty promotion command');
    const envelope = JSON.parse(message.Body) as {
      version: 1;
      eventId: string;
      eventType: 'PROMOTION_RELEASE';
      payload: { cancellationId: string; orderId: string };
    };
    if (envelope.eventType !== 'PROMOTION_RELEASE') {
      throw new Error(`Unsupported promotion command: ${envelope.eventType}`);
    }
    await this.redemptionRepository.releaseOrder({
      orderId: envelope.payload.orderId,
      eventId: envelope.eventId,
    });
    await this.sqsService.send(SqsConfiguration.CANCELLATION_RESULT_QUEUE_NAME, {
      id: `${envelope.eventId}:result`,
      body: {
        version: 1,
        eventId: `${envelope.eventId}:result`,
        eventType: 'CANCELLATION_EFFECT_COMPLETED',
        payload: {
          cancellationId: envelope.payload.cancellationId,
          effect: 'PROMOTION',
        },
      },
      delaySeconds: 0,
    });
  }
}
