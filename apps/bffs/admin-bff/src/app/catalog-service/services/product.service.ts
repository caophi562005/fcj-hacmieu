import {
  CATALOG_SERVICE_PACKAGE_NAME,
  CreateProductRequest,
  DeleteProductRequest,
  PRODUCT_MODULE_SERVICE_NAME,
  ProductModuleClient,
  ProductResponse,
  UpdateProductRequest,
} from '@common/interfaces/proto-types/catalog';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductService implements OnModuleInit {
  private productModule!: ProductModuleClient;

  constructor(
    @Inject(CATALOG_SERVICE_PACKAGE_NAME)
    private catalogClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productModule = this.catalogClient.getService<ProductModuleClient>(
      PRODUCT_MODULE_SERVICE_NAME,
    );
  }

  async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    return firstValueFrom(this.productModule.createProduct(data));
  }

  async updateProduct(data: UpdateProductRequest): Promise<ProductResponse> {
    return firstValueFrom(this.productModule.updateProduct(data));
  }

  async deleteProduct(data: DeleteProductRequest): Promise<ProductResponse> {
    return firstValueFrom(this.productModule.deleteProduct(data));
  }
}
