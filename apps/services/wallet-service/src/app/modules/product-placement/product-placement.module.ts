import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ProductPlacementGrpcController } from './controllers/product-placement-grpc.controller';
import { ProductPlacementRepository } from './repositories/product-placement.repository';
import { ProductPlacementService } from './services/product-placement.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.CATALOG_SERVICE)]),
  ],
  controllers: [ProductPlacementGrpcController],
  providers: [ProductPlacementRepository, ProductPlacementService],
})
export class ProductPlacementModule {}
