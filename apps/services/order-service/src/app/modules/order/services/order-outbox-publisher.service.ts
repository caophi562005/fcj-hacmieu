import { SqsConfiguration } from '@common/configurations/sqs.config';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { OrderRepository } from '../repositories/order.repository';
import { getOutboxQueueKey } from './order-outbox-routing';

@Injectable()
export class OrderOutboxPublisherService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(OrderOutboxPublisherService.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(
    private readonly repository: OrderRepository,
    private readonly sqsService: SqsService,
  ) {}

  onApplicationBootstrap() {
    void this.publishPending();
    this.timer = setInterval(() => void this.publishPending(), 10_000);
    this.timer.unref?.();
  }

  onApplicationShutdown() {
    if (this.timer) clearInterval(this.timer);
  }

  private async publishPending() {
    if (this.running) return;
    this.running = true;
    try {
      const events = await this.repository.claimOutboxEvents(100);
      for (const event of events) {
        try {
          const queueKey = getOutboxQueueKey(event.eventType);
          const queues = {
            INVENTORY_COMMAND: SqsConfiguration.INVENTORY_COMMAND_QUEUE_NAME,
            PAYMENT_COMMAND: SqsConfiguration.PAYMENT_COMMAND_QUEUE_NAME,
            WALLET_COMMAND: SqsConfiguration.WALLET_COMMAND_QUEUE_NAME,
            PROMOTION_COMMAND: SqsConfiguration.PROMOTION_COMMAND_QUEUE_NAME,
            NOTIFICATION_COMMAND:
              SqsConfiguration.NOTIFICATION_COMMAND_QUEUE_NAME,
            SETTLEMENT: SqsConfiguration.SETTLE_ORDER_REVENUE_QUEUE_NAME,
          } as const;
          await this.sqsService.send(
            queues[queueKey],
            {
              id: event.id,
              body: {
                version: 1,
                eventId: event.id,
                eventType: event.eventType,
                occurredAt: event.createdAt.toISOString(),
                payload: event.payload,
              },
              delaySeconds: 0,
            },
          );
          await this.repository.markOutboxPublished(event.id);
        } catch (error) {
          this.logger.error(
            `Failed to publish outbox event ${event.id}`,
            error instanceof Error ? error.stack : undefined,
          );
          await this.repository.markOutboxFailed(event.id, error);
        }
      }
    } catch (error) {
      this.logger.error(
        'Failed to poll order outbox',
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.running = false;
    }
  }
}
