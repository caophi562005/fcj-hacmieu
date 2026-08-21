import {
  CancelProductPlacementRequest,
  CreateProductPlacementRequest,
  GetActiveProductPlacementsRequest,
  GetProductPlacementConfigRequest,
  GetProductPlacementsRequest,
  PRODUCT_PLACEMENT_MODULE_SERVICE_NAME,
  ProductPlacementModuleClient,
  WALLET_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/wallet';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductPlacementService implements OnModuleInit {
  private client!: ProductPlacementModuleClient;

  constructor(
    @Inject(WALLET_SERVICE_PACKAGE_NAME) private readonly grpc: ClientGrpc,
  ) {}

  onModuleInit() {
    this.client = this.grpc.getService<ProductPlacementModuleClient>(
      PRODUCT_PLACEMENT_MODULE_SERVICE_NAME,
    );
  }

  getConfig(data: GetProductPlacementConfigRequest) {
    return firstValueFrom(this.client.getProductPlacementConfig(data));
  }

  create(data: CreateProductPlacementRequest) {
    return firstValueFrom(this.client.createProductPlacement(data));
  }

  list(data: GetProductPlacementsRequest) {
    return firstValueFrom(this.client.getProductPlacements(data));
  }

  listActive(data: GetActiveProductPlacementsRequest) {
    return firstValueFrom(this.client.getActiveProductPlacements(data));
  }

  cancel(data: CancelProductPlacementRequest) {
    return firstValueFrom(this.client.cancelProductPlacement(data));
  }
}
