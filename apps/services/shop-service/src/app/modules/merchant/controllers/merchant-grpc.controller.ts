import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateMerchantRequest,
  DeleteMerchantRequest,
  GetManyMerchantsRequest,
  GetMerchantRequest,
  UpdateMerchantRequest,
} from '@common/interfaces/models/shop';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MerchantService } from '../services/merchant.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class MerchantGrpcController {
  constructor(private readonly merchantService: MerchantService) {}

  @GrpcMethod(GrpcModuleName.SHOP.MERCHANT, 'GetManyMerchants')
  getManyMerchants(data: GetManyMerchantsRequest) {
    return this.merchantService.list(data);
  }

  @GrpcMethod(GrpcModuleName.SHOP.MERCHANT, 'GetMerchant')
  getMerchant(data: GetMerchantRequest) {
    return this.merchantService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.SHOP.MERCHANT, 'CreateMerchant')
  createMerchant(data: CreateMerchantRequest) {
    return this.merchantService.create(data);
  }

  @GrpcMethod(GrpcModuleName.SHOP.MERCHANT, 'UpdateMerchant')
  updateMerchant(data: UpdateMerchantRequest) {
    return this.merchantService.update(data);
  }

  @GrpcMethod(GrpcModuleName.SHOP.MERCHANT, 'DeleteMerchant')
  deleteMerchant(data: DeleteMerchantRequest) {
    return this.merchantService.delete(data);
  }
}
