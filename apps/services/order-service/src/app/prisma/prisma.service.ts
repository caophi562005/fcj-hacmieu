import { DatabaseConfiguration } from '@common/configurations/database.config';
import {
  buildMysqlAdapterConfig,
  maskDatabaseError,
} from '@common/utils/mysql-adapter.util';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma-client/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: new PrismaMariaDb(
        buildMysqlAdapterConfig(
          DatabaseConfiguration.ORDER_SERVICE_MYSQL_DATABASE_URL,
        ),
      ),
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error(maskDatabaseError(error));
      throw new Error('order-service không kết nối được MySQL');
    }
  }
}
