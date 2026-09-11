import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  GetSKURequest,
  IncreaseStockRequest,
} from '@common/interfaces/models/catalog';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SKUService } from '../services/sku.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class SKUGrpcController {
  constructor(private readonly sKUService: SKUService) {}

  @GrpcMethod(GrpcModuleName.CATALOG.SKU, 'GetSKU')
  getSKU(data: GetSKURequest) {
    return this.sKUService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.SKU, 'RestoreStock')
  async restoreStock(data: IncreaseStockRequest) {
    await this.sKUService.increaseStock(data);
    return { success: true };
  }
}
