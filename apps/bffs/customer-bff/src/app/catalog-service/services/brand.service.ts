import {
  BRAND_MODULE_SERVICE_NAME,
  BrandModuleClient,
  BrandResponse,
  CATALOG_SERVICE_PACKAGE_NAME,
  GetBrandRequest,
  GetManyBrandsRequest,
} from '@common/interfaces/proto-types/catalog';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BrandService implements OnModuleInit {
  private brandModule!: BrandModuleClient;

  constructor(
    @Inject(CATALOG_SERVICE_PACKAGE_NAME)
    private catalogClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.brandModule = this.catalogClient.getService<BrandModuleClient>(
      BRAND_MODULE_SERVICE_NAME,
    );
  }

  async getManyBrands(data: GetManyBrandsRequest): Promise<any> {
    return firstValueFrom(this.brandModule.getManyBrands(data));
  }

  async getBrand(data: GetBrandRequest): Promise<BrandResponse> {
    return firstValueFrom(this.brandModule.getBrand(data));
  }
}
