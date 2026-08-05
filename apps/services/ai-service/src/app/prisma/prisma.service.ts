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
          DatabaseConfiguration.AI_SERVICE_MYSQL_DATABASE_URL,
        ),
      ),
    });
  }

  /**
   * Kiểm tra kết nối ngay khi khởi động. Không có bước này, lỗi cấu hình chỉ lộ
   * ra ở request đầu tiên và pod vẫn báo ready.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error(maskDatabaseError(error));
      throw new Error('ai-service không kết nối được MySQL');
    }
  }
}
