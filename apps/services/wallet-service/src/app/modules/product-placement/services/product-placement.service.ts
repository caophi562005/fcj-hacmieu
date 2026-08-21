import { AppConfiguration } from '@common/configurations/app.config';
import { ProductStatusValues } from '@common/constants/product.constant';
import { PRODUCT_PLACEMENT_ALLOWED_DURATIONS } from '@common/constants/product-placement.constant';
import {
  CancelProductPlacementRequestSchema,
  CancelProductPlacementRequest,
  CreateProductPlacementRequestSchema,
  CreateProductPlacementRequest,
  GetProductPlacementsRequestSchema,
  GetProductPlacementsRequest,
} from '@common/interfaces/models/wallet';
import {
  CATALOG_SERVICE_PACKAGE_NAME,
  PRODUCT_MODULE_SERVICE_NAME,
  ProductModuleClient,
} from '@common/interfaces/proto-types/catalog';
import { ProductPlacementResponse } from '@common/interfaces/proto-types/wallet';
import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ProductPlacementRepository } from '../repositories/product-placement.repository';
import { ProductPlacementModel } from '../../../../generated/prisma-client/models/ProductPlacement';

@Injectable()
export class ProductPlacementService implements OnModuleInit {
  private productModule!: ProductModuleClient;

  constructor(
    @Inject(CATALOG_SERVICE_PACKAGE_NAME)
    private readonly catalogClient: ClientGrpc,
    private readonly repository: ProductPlacementRepository,
  ) {}

  onModuleInit() {
    this.productModule = this.catalogClient.getService<ProductModuleClient>(
      PRODUCT_MODULE_SERVICE_NAME,
    );
  }

  private serialize(item: ProductPlacementModel): ProductPlacementResponse {
    const status =
      item.status === 'ACTIVE' && item.endsAt <= new Date()
        ? 'EXPIRED'
        : item.status;
    return {
      id: item.id,
      shopId: item.shopId,
      productId: item.productId,
      position: item.position,
      amount: item.amount,
      durationDays: item.durationDays,
      status,
      startsAt: item.startsAt.toISOString(),
      endsAt: item.endsAt.toISOString(),
      cancelledAt: item.cancelledAt?.toISOString() ?? undefined,
      cancelledBy: item.cancelledBy ?? undefined,
      cancelReason: item.cancelReason ?? undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async getConfig() {
    const occupiedSlots = await this.repository.countActive();
    return {
      maxActiveSlots: AppConfiguration.HOME_PLACEMENT_MAX_ACTIVE,
      occupiedSlots,
      availableSlots: Math.max(
        0,
        AppConfiguration.HOME_PLACEMENT_MAX_ACTIVE - occupiedSlots,
      ),
      pricePerDay: AppConfiguration.HOME_PLACEMENT_PRICE_PER_DAY,
      allowedDurations: [...PRODUCT_PLACEMENT_ALLOWED_DURATIONS],
    };
  }

  async create(data: CreateProductPlacementRequest) {
    const parsed = CreateProductPlacementRequestSchema.safeParse(data);
    if (!parsed.success) {
      throw new BadRequestException('Error.InvalidProductPlacementRequest');
    }
    data = parsed.data;
    if (
      !PRODUCT_PLACEMENT_ALLOWED_DURATIONS.includes(
        data.durationDays as (typeof PRODUCT_PLACEMENT_ALLOWED_DURATIONS)[number],
      )
    ) {
      throw new BadRequestException('Error.InvalidProductPlacementDuration');
    }

    const existing = await this.repository.findByIdempotencyKey(
      data.idempotencyKey,
    );
    if (existing) {
      if (
        existing.shopId !== data.shopId ||
        existing.productId !== data.productId ||
        existing.durationDays !== data.durationDays
      ) {
        throw new BadRequestException('Error.IdempotencyKeyAlreadyUsed');
      }
      return this.serialize(existing);
    }

    const product = await firstValueFrom(
      this.productModule.getProduct({
        processId: data.processId,
        id: data.productId,
        shopId: data.shopId,
      }),
    );
    if (
      product.shopId !== data.shopId ||
      product.status !== ProductStatusValues.ACTIVE ||
      !product.isApproved ||
      product.isHidden ||
      !!product.deletedAt
    ) {
      throw new BadRequestException('Error.ProductNotEligibleForPlacement');
    }
    const amount =
      AppConfiguration.HOME_PLACEMENT_PRICE_PER_DAY * data.durationDays;
    return this.serialize(await this.repository.create(data, amount));
  }

  async list(data: GetProductPlacementsRequest) {
    const parsed = GetProductPlacementsRequestSchema.safeParse(data);
    if (!parsed.success) {
      throw new BadRequestException('Error.InvalidProductPlacementQuery');
    }
    const result = await this.repository.list(parsed.data);
    return {
      ...result,
      placements: result.placements.map((item) => this.serialize(item)),
    };
  }

  async listActive() {
    const result = await this.repository.listActive();
    return {
      ...result,
      placements: result.placements.map((item) => this.serialize(item)),
    };
  }

  async cancel(data: CancelProductPlacementRequest) {
    const parsed = CancelProductPlacementRequestSchema.safeParse(data);
    if (!parsed.success) {
      throw new BadRequestException(
        'Error.InvalidProductPlacementCancellation',
      );
    }
    return this.serialize(await this.repository.cancel(parsed.data));
  }
}
