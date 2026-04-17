/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { AppConfiguration } from '@common/configurations/app.config';
import { BaseConfiguration } from '@common/configurations/base.config';
import { GrpcConfiguration } from '@common/configurations/grpc.config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const globalPrefix = BaseConfiguration.GLOBAL_PREFIX || 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = AppConfiguration.UTILITY_SERVICE_PORT || 3007;

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      url: GrpcConfiguration.UTILITY_SERVICE_GRPC_URL,
      package: ['UTILITY_SERVICE'],
      protoPath: [
        join(__dirname, `${GrpcConfiguration.PROTO_PATH}utility.proto`),
      ],
    },
  });
  await app.startAllMicroservices();

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
