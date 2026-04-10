import {
  CATALOG_SERVICE_PACKAGE_NAME,
  CATEGORY_MODULE_SERVICE_NAME,
  CategoryModuleClient,
  CategoryResponse,
  CreateCategoryRequest,
  DeleteCategoryRequest,
  UpdateCategoryRequest,
} from '@common/interfaces/proto-types/catalog';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CategoryService implements OnModuleInit {
  private categoryModule!: CategoryModuleClient;

  constructor(
    @Inject(CATALOG_SERVICE_PACKAGE_NAME)
    private catalogClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.categoryModule = this.catalogClient.getService<CategoryModuleClient>(
      CATEGORY_MODULE_SERVICE_NAME,
    );
  }

  async createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
    return firstValueFrom(this.categoryModule.createCategory(data));
  }

  async updateCategory(data: UpdateCategoryRequest): Promise<CategoryResponse> {
    return firstValueFrom(this.categoryModule.updateCategory(data));
  }

  async deleteCategory(data: DeleteCategoryRequest): Promise<CategoryResponse> {
    return firstValueFrom(this.categoryModule.deleteCategory(data));
  }
}
