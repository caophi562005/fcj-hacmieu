import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateShopRequest,
  DeleteShopRequest,
  GetManyShopsRequest,
  GetShopRequest,
  UpdateShopRequest,
} from '@common/interfaces/models/shop';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ShopService } from '../services/shop.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class ShopGrpcController {
  constructor(private readonly shopService: ShopService) {}

  @GrpcMethod(GrpcModuleName.SHOP.SHOP, 'GetManyShops')
  getManyShops(data: GetManyShopsRequest) {
    return this.shopService.list(data);
  }

  @GrpcMethod(GrpcModuleName.SHOP.SHOP, 'GetShop')
  getShop(data: GetShopRequest) {
    return this.shopService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.SHOP.SHOP, 'CreateShop')
  createShop(data: CreateShopRequest) {
    return this.shopService.create(data);
  }

  @GrpcMethod(GrpcModuleName.SHOP.SHOP, 'UpdateShop')
  updateShop(data: UpdateShopRequest) {
    return this.shopService.update(data);
  }

  @GrpcMethod(GrpcModuleName.SHOP.SHOP, 'DeleteShop')
  deleteShop(data: DeleteShopRequest) {
    return this.shopService.delete(data);
  }
}
