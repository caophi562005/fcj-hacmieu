import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateShopRequest,
  DeleteShopRequest,
  GetManyShopsRequest,
  GetManyShopsResponse,
  GetShopRequest,
  ShopResponse,
  UpdateShopRequest,
} from '@common/interfaces/models/shop';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ShopRepository } from '../repositories/shop.repository';

@Injectable()
export class ShopService {
  constructor(private readonly shopRepository: ShopRepository) {}

  async list(data: GetManyShopsRequest): Promise<GetManyShopsResponse> {
    const shops = await this.shopRepository.list(data);
    if (shops.totalItems === 0) {
      throw new NotFoundException('Error.ShopNotFound');
    }
    return shops;
  }

  async findById(data: GetShopRequest): Promise<ShopResponse> {
    const shop = await this.shopRepository.findById(data);
    if (!shop) {
      throw new NotFoundException('Error.ShopNotFound');
    }
    return shop;
  }

  async create({
    processId,
    ...data
  }: CreateShopRequest): Promise<ShopResponse> {
    try {
      const createdShop = await this.shopRepository.create(data);
      return createdShop;
    } catch (error: any) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.ShopAlreadyExists');
      }
      throw error;
    }
  }

  async update({
    processId,
    ...data
  }: UpdateShopRequest): Promise<ShopResponse> {
    try {
      const updatedShop = await this.shopRepository.update(data);
      return updatedShop;
    } catch (error: any) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ShopNotFound');
      }
      throw error;
    }
  }

  async delete(data: DeleteShopRequest): Promise<ShopResponse> {
    try {
      const deletedShop = await this.shopRepository.delete(data, false);
      return deletedShop;
    } catch (error: any) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ShopNotFound');
      }
      throw error;
    }
  }
}
