import {
  CATALOG_SERVICE_PACKAGE_NAME,
  GetManyProductsRequest,
  GetProductRequest,
  PRODUCT_MODULE_SERVICE_NAME,
  ProductModuleClient,
  ProductResponse,
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

  async getManyProducts(data: GetManyProductsRequest): Promise<any> {
    return firstValueFrom(this.productModule.getManyProducts(data));
  }

  async getProduct(data: GetProductRequest): Promise<ProductResponse> {
    return firstValueFrom(this.productModule.getProduct(data));
  }
}
