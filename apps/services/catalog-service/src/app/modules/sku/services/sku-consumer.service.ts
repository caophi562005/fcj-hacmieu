import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { SKUService } from './sku.service';
import { SqsService } from '@ssut/nestjs-sqs';

type SqsMessage = {
  MessageId?: string;
  Body?: string;
};

@Injectable()
export class SKUConsumerService {
  private readonly logger = new Logger(SKUConsumerService.name);

  constructor(
    private readonly sKUService: SKUService,
    private readonly sqsService: SqsService,
  ) {}

  @SqsMessageHandler(SqsConfiguration.INVENTORY_COMMAND_QUEUE_NAME, false)
  async handleInventoryCommand(message: SqsMessage) {
    if (!message.Body) throw new Error('Empty inventory command');
    const envelope = JSON.parse(message.Body) as {
      version: 1;
      eventId: string;
      eventType: 'INVENTORY_RESERVE' | 'INVENTORY_RELEASE';
      payload: {
        cancellationId?: string;
        orderId: string;
        userId: string;
        items: Array<{ skuId: string; productId?: string; quantity: number }>;
      };
    };
    if (envelope.eventType === 'INVENTORY_RESERVE') {
      await this.sKUService.reserveStock({
        ...envelope.payload,
        items: envelope.payload.items.map((item) => ({
          ...item,
          productId: item.productId ?? '',
        })),
      });
    } else if (envelope.eventType === 'INVENTORY_RELEASE') {
      await this.sKUService.releaseStock(envelope.payload);
      await this.sendResult(envelope, 'INVENTORY');
    } else {
      throw new Error(`Unsupported inventory command: ${envelope.eventType}`);
    }
    this.logger.log(`Applied inventory command ${envelope.eventId}`);
  }

  private async sendResult(
    envelope: { eventId: string; payload: { cancellationId?: string } },
    effect: string,
  ) {
    if (!envelope.payload.cancellationId) return;
    await this.sqsService.send(SqsConfiguration.CANCELLATION_RESULT_QUEUE_NAME, {
      id: `${envelope.eventId}:result`,
      body: {
        version: 1,
        eventId: `${envelope.eventId}:result`,
        eventType: 'CANCELLATION_EFFECT_COMPLETED',
        payload: { cancellationId: envelope.payload.cancellationId, effect },
      },
      delaySeconds: 0,
    });
  }
}
