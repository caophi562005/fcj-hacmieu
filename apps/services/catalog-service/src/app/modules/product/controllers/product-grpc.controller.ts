import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateProductRequest,
  DeleteProductRequest,
  UpdateProductRequest,
  ValidateProductsRequest,
} from '@common/interfaces/models/catalog';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductService } from '../services/product.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class ProductGrpcController {
  constructor(private readonly productService: ProductService) {}

  @GrpcMethod(GrpcModuleName.CATALOG.PRODUCT, 'GetManyProducts')
  getManyProducts(data: any) {
    return this.productService.list(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.PRODUCT, 'GetProduct')
  getProduct(data: any) {
    return this.productService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.PRODUCT, 'CreateProduct')
  createProduct(data: CreateProductRequest) {
    return this.productService.create(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.PRODUCT, 'UpdateProduct')
  updateProduct(data: UpdateProductRequest) {
    return this.productService.update(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.PRODUCT, 'DeleteProduct')
  deleteProduct(data: DeleteProductRequest) {
    return this.productService.delete(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.PRODUCT, 'ValidateProducts')
  validateProducts(data: ValidateProductsRequest) {
    return this.productService.validateProducts(data);
  }
}
