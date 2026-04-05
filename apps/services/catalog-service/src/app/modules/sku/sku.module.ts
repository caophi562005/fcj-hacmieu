import { Module } from '@nestjs/common';
import { SKUGrpcController } from './controllers/sku-grpc.controller';
import { SKURepository } from './repositories/sku.repository';
import { SKUService } from './services/sku.service';

@Module({
  controllers: [SKUGrpcController],
  providers: [SKURepository, SKUService],
})
export class SKUModule {}
