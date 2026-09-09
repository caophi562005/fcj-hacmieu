import { SqsConfiguration } from '@common/configurations/sqs.config';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { MarketingService } from './marketing.service';

type SqsMessage = { MessageId?: string; Body?: string };

@Injectable()
export class MarketingConsumerService {
  private readonly logger = new Logger(MarketingConsumerService.name);

  constructor(private readonly marketingService: MarketingService) {}

  @SqsMessageHandler(SqsConfiguration.SEND_MARKETING_EMAIL_QUEUE_NAME, false)
  async handleDelivery(message: SqsMessage) {
    const body = message.Body
      ? (JSON.parse(message.Body) as { deliveryId?: string })
      : null;
    if (!body?.deliveryId) {
      this.logger.warn(
        `Skip invalid marketing email message ${message.MessageId}`,
      );
      return;
    }
    await this.marketingService.processDelivery({
      deliveryId: body.deliveryId,
    });
  }

  @SqsMessageHandler(SqsConfiguration.SCAN_MARKETING_QUEUE_NAME, false)
  async handleScan(message: SqsMessage) {
    const body = message.Body
      ? (JSON.parse(message.Body) as { now?: string })
      : {};
    await this.marketingService.scan({ now: body.now });
    this.logger.log(
      `Marketing scan completed for message ${message.MessageId}`,
    );
  }
}
