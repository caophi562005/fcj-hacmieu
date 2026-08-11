import { DatabaseConfiguration } from '@common/configurations/database.config';
import {
  createPrismaMariaDbAdapter,
  maskDatabaseError,
} from '@common/utils/mysql-adapter.util';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma-client/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: createPrismaMariaDbAdapter(
        DatabaseConfiguration.PAYMENT_SERVICE_MYSQL_DATABASE_URL,
      ),
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (error) {
      this.logger.error(maskDatabaseError(error));
      throw new Error('payment-service không kết nối được MySQL');
    }
  }
}
