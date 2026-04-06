import { DatabaseConfiguration } from '@common/configurations/database.config';
import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma-client/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: DatabaseConfiguration.PAYMENT_SERVICE_DATABASE_URL,
    });
    super({ adapter });
  }
}
