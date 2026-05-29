import {
  CreateMerchantRequest,
  DeleteMerchantRequest,
  GetManyMerchantsRequest,
  GetManyMerchantsResponse,
  GetMerchantRequest,
  MERCHANT_MODULE_SERVICE_NAME,
  MerchantModuleClient,
  MerchantResponse,
  SHOP_SERVICE_PACKAGE_NAME,
  UpdateMerchantRequest,
} from '@common/interfaces/proto-types/shop';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MerchantService implements OnModuleInit {
  private merchantModule!: MerchantModuleClient;

  constructor(
    @Inject(SHOP_SERVICE_PACKAGE_NAME)
    private shopClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.merchantModule = this.shopClient.getService<MerchantModuleClient>(
      MERCHANT_MODULE_SERVICE_NAME,
    );
  }

  async getManyMerchants(
    data: GetManyMerchantsRequest,
  ): Promise<GetManyMerchantsResponse> {
    return firstValueFrom(this.merchantModule.getManyMerchants(data));
  }

  async getMerchant(data: GetMerchantRequest): Promise<MerchantResponse> {
    return firstValueFrom(this.merchantModule.getMerchant(data));
  }

  async createMerchant(data: CreateMerchantRequest): Promise<MerchantResponse> {
    return firstValueFrom(this.merchantModule.createMerchant(data));
  }

  async updateMerchant(data: UpdateMerchantRequest): Promise<MerchantResponse> {
    return firstValueFrom(this.merchantModule.updateMerchant(data));
  }

  async deleteMerchant(data: DeleteMerchantRequest): Promise<MerchantResponse> {
    return firstValueFrom(this.merchantModule.deleteMerchant(data));
  }
}
