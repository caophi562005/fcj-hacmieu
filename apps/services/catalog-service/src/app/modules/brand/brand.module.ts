import { Global, Module } from '@nestjs/common';
import { BrandGrpcController } from './controllers/brand-grpc.controller';
import { BrandRepository } from './repositories/brand.repository';
import { BrandService } from './services/brand.service';

@Global()
@Module({
  controllers: [BrandGrpcController],
  providers: [BrandRepository, BrandService],
  exports: [BrandService],
})
export class BrandModule {}
