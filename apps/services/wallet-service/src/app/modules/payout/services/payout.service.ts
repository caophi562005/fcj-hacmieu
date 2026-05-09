import type {
  CreateShopPayoutRequest,
  DeleteShopPayoutRequest,
  GetShopPayoutByIdRequest,
  GetShopPayoutsRequest,
  GetShopPayoutsResponse,
  ShopPayoutResponse,
  UpdateShopPayoutStatusRequest,
} from '@common/interfaces/models/wallet';
import { Injectable } from '@nestjs/common';
import { PayoutRepository } from '../repositories/payout.repository';

@Injectable()
export class PayoutService {
  constructor(private readonly payoutRepository: PayoutRepository) {}

  async createShopPayout({
    processId: _,
    ...data
  }: CreateShopPayoutRequest): Promise<ShopPayoutResponse> {
    return this.payoutRepository.create(data);
  }

  async getShopPayoutById({
    processId: _,
    ...data
  }: GetShopPayoutByIdRequest): Promise<ShopPayoutResponse> {
    return this.payoutRepository.getById(data);
  }

  async getShopPayouts({
    processId: _,
    ...data
  }: GetShopPayoutsRequest): Promise<GetShopPayoutsResponse> {
    return this.payoutRepository.list(data);
  }

  async updateShopPayoutStatus({
    processId: _,
    ...data
  }: UpdateShopPayoutStatusRequest): Promise<ShopPayoutResponse> {
    return this.payoutRepository.updateStatus(data);
  }

  async deleteShopPayout({
    processId: _,
    ...data
  }: DeleteShopPayoutRequest): Promise<ShopPayoutResponse> {
    return this.payoutRepository.delete(data);
  }
}
