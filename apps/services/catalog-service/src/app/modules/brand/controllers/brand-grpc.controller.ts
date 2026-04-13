import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateBrandRequest,
  DeleteBrandRequest,
  UpdateBrandRequest,
} from '@common/interfaces/models/catalog';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BrandService } from '../services/brand.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class BrandGrpcController {
  constructor(private readonly brandService: BrandService) {}

  @GrpcMethod(GrpcModuleName.CATALOG.BRAND, 'GetManyBrands')
  getManyBrands(data: any) {
    return this.brandService.list(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.BRAND, 'GetBrand')
  getBrand(data: any) {
    return this.brandService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.BRAND, 'CreateBrand')
  createBrand(data: CreateBrandRequest) {
    return this.brandService.create(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.BRAND, 'UpdateBrand')
  updateBrand(data: UpdateBrandRequest) {
    return this.brandService.update(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.BRAND, 'DeleteBrand')
  deleteBrand(data: DeleteBrandRequest) {
    return this.brandService.delete(data);
  }
}
