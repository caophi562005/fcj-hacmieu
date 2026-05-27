import { RedisConfiguration } from '@common/configurations/redis.config';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  BrandResponse,
  CreateBrandRequest,
  DeleteBrandRequest,
  GetManyBrandsResponse,
  UpdateBrandRequest,
} from '@common/interfaces/models/catalog';
import {
  generateBrandByIdCacheKey,
  generateBrandListCacheKey,
} from '@common/utils/cache-key.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import ms, { StringValue } from 'ms';
import { BrandRepository } from '../repositories/brand.repository';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async list(data: any) {
    const cacheKey = generateBrandListCacheKey(data);
    const cached = await this.cacheManager.get<GetManyBrandsResponse>(cacheKey);
    if (cached) return cached;

    const brands = await this.brandRepository.list(data);
    if (brands.totalItems === 0) {
      throw new NotFoundException('Error.NoBrandsFound');
    }

    this.cacheManager.set(
      cacheKey,
      brands,
      ms(RedisConfiguration.CACHE_CATALOG_TTL as StringValue),
    );
    return brands;
  }

  async findById(data: any) {
    const cacheKey = generateBrandByIdCacheKey(data.id);
    const cached = await this.cacheManager.get<BrandResponse>(cacheKey);
    if (cached) return cached;

    const brand = await this.brandRepository.findById(data);
    if (!brand) {
      throw new NotFoundException('Error.BrandNotFound');
    }

    this.cacheManager.set(
      cacheKey,
      brand,
      ms(RedisConfiguration.CACHE_CATALOG_TTL as StringValue),
    );
    return brand;
  }

  async create({
    processId,
    ...data
  }: CreateBrandRequest): Promise<BrandResponse> {
    try {
      const createdBrand = await this.brandRepository.create(data);
      return createdBrand;
    } catch (error) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.BrandAlreadyExists');
      }
      throw error;
    }
  }

  async update({
    processId,
    ...data
  }: UpdateBrandRequest): Promise<BrandResponse> {
    try {
      const updatedBrand = await this.brandRepository.update(data);
      this.cacheManager.del(generateBrandByIdCacheKey(updatedBrand.id));
      return updatedBrand;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.BrandNotFound');
      }
      throw error;
    }
  }

  async delete(data: DeleteBrandRequest): Promise<BrandResponse> {
    try {
      const deletedBrand = await this.brandRepository.delete(data, false);
      this.cacheManager.del(generateBrandByIdCacheKey(deletedBrand.id));
      return deletedBrand;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.BrandNotFound');
      }
      throw error;
    }
  }
}
