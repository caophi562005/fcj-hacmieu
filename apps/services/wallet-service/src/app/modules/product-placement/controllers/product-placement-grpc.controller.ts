import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CancelProductPlacementRequest,
  CreateProductPlacementRequest,
  GetProductPlacementsRequest,
} from '@common/interfaces/models/wallet';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductPlacementService } from '../services/product-placement.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class ProductPlacementGrpcController {
  constructor(private readonly service: ProductPlacementService) {}

  @GrpcMethod(
    GrpcModuleName.WALLET.PRODUCT_PLACEMENT,
    'GetProductPlacementConfig',
  )
  getConfig() {
    return this.service.getConfig();
  }

  @GrpcMethod(GrpcModuleName.WALLET.PRODUCT_PLACEMENT, 'CreateProductPlacement')
  create(data: CreateProductPlacementRequest) {
    return this.service.create(data);
  }

  @GrpcMethod(GrpcModuleName.WALLET.PRODUCT_PLACEMENT, 'GetProductPlacements')
  list(data: GetProductPlacementsRequest) {
    return this.service.list(data);
  }

  @GrpcMethod(
    GrpcModuleName.WALLET.PRODUCT_PLACEMENT,
    'GetActiveProductPlacements',
  )
  listActive() {
    return this.service.listActive();
  }

  @GrpcMethod(GrpcModuleName.WALLET.PRODUCT_PLACEMENT, 'CancelProductPlacement')
  cancel(data: CancelProductPlacementRequest) {
    return this.service.cancel(data);
  }
}
