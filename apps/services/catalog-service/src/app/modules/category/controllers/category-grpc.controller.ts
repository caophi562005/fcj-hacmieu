import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateCategoryRequest,
  DeleteCategoryRequest,
  UpdateCategoryRequest,
} from '@common/interfaces/models/catalog';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CategoryService } from '../services/category.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class CategoryGrpcController {
  constructor(private readonly categoryService: CategoryService) {}

  @GrpcMethod(GrpcModuleName.CATALOG.CATEGORY, 'GetManyCategories')
  getManyCategories(data: any): Promise<any> {
    return this.categoryService.list(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.CATEGORY, 'GetCategory')
  getCategory(data: any): Promise<any> {
    return this.categoryService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.CATEGORY, 'CreateCategory')
  createCategory(data: CreateCategoryRequest): Promise<any> {
    return this.categoryService.create(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.CATEGORY, 'UpdateCategory')
  updateCategory(data: UpdateCategoryRequest): Promise<any> {
    return this.categoryService.update(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.CATEGORY, 'DeleteCategory')
  deleteCategory(data: DeleteCategoryRequest): Promise<any> {
    return this.categoryService.delete(data);
  }
}
