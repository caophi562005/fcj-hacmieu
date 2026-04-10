import {
  BRAND_MODULE_SERVICE_NAME,
  BrandModuleClient,
  BrandResponse,
  CATALOG_SERVICE_PACKAGE_NAME,
  CreateBrandRequest,
  DeleteBrandRequest,
  UpdateBrandRequest,
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

  async createBrand(data: CreateBrandRequest): Promise<BrandResponse> {
    return firstValueFrom(this.brandModule.createBrand(data));
  }

  async updateBrand(data: UpdateBrandRequest): Promise<BrandResponse> {
    return firstValueFrom(this.brandModule.updateBrand(data));
  }

  async deleteBrand(data: DeleteBrandRequest): Promise<BrandResponse> {
    return firstValueFrom(this.brandModule.deleteBrand(data));
  }
}
