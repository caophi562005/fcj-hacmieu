import {
  CATALOG_SERVICE_PACKAGE_NAME,
  CATEGORY_MODULE_SERVICE_NAME,
  CategoryModuleClient,
  CategoryResponse,
  GetCategoryRequest,
  GetManyCategoriesRequest,
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

  async getManyCategories(data: GetManyCategoriesRequest): Promise<any> {
    return firstValueFrom(this.categoryModule.getManyCategories(data));
  }

  async getCategory(data: GetCategoryRequest): Promise<CategoryResponse> {
    return firstValueFrom(this.categoryModule.getCategory(data));
  }
}
