import { Module } from '@nestjs/common';
import { ProductGrpcController } from './controllers/product-grpc.controller';
import { ProductRepository } from './repositories/product.repository';
import { ProductService } from './services/product.service';

@Module({
  controllers: [ProductGrpcController],
  providers: [ProductRepository, ProductService],
})
export class ProductModule {}
