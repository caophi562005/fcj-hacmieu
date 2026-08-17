import { SqsConfiguration } from '@common/configurations/sqs.config';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { v4 as uuidv4 } from 'uuid';
import { OrderRepository } from '../repositories/order.repository';

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
          await this.sqsService.send(
            SqsConfiguration.SETTLE_ORDER_REVENUE_QUEUE_NAME,
            { id: uuidv4(), body: event.payload, delaySeconds: 0 },
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
