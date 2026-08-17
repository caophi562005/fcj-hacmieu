import {
  CreateSellerSettlementRequest,
  GetSellerSettlementByIdRequest,
  GetSellerSettlementSummaryRequest,
  GetSellerSettlementsRequest,
  UpdateSellerSettlementStatusRequest,
} from '@common/interfaces/models/wallet';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { SellerSettlementRepository } from '../repositories/seller-settlement.repository';

const POLL_INTERVAL_MS = 30_000;
const BATCH_SIZE = 100;

@Injectable()
export class SellerSettlementService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(SellerSettlementService.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(private readonly repository: SellerSettlementRepository) {}

  create(data: CreateSellerSettlementRequest) {
    return this.repository.create(data);
  }

  getSummary(data: GetSellerSettlementSummaryRequest) {
    return this.repository.getSummary(data.shopId);
  }

  list(data: GetSellerSettlementsRequest) {
    return this.repository.list(data);
  }

  getById(data: GetSellerSettlementByIdRequest) {
    return this.repository.getById(data);
  }

  updateStatus(data: UpdateSellerSettlementStatusRequest) {
    return this.repository.updateStatus(data);
  }

  onApplicationBootstrap() {
    void this.processDue();
    this.timer = setInterval(() => void this.processDue(), POLL_INTERVAL_MS);
    this.timer.unref?.();
  }

  onApplicationShutdown() {
    if (this.timer) clearInterval(this.timer);
  }

  private async processDue() {
    if (this.running) return;
    this.running = true;
    try {
      const ids = await this.repository.claimDue(BATCH_SIZE);
      for (const id of ids) {
        try {
          await this.repository.settle(id);
        } catch (error) {
          this.logger.error(
            `Settlement ${id} failed`,
            error instanceof Error ? error.stack : undefined,
          );
          await this.repository.markFailed(id, error);
        }
      }
    } catch (error) {
      this.logger.error(
        'Failed to poll seller settlements',
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.running = false;
    }
  }
}
