import { RedisConfiguration } from '@common/configurations/redis.config';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateCategoryRequest,
  DeleteCategoryRequest,
  GetCategoryRequest,
  GetCategoryResponse,
  GetManyCategoriesRequest,
  GetManyCategoriesResponse,
  UpdateCategoryRequest,
} from '@common/interfaces/models/catalog';
import {
  generateCategoryByIdCacheKey,
  generateCategoryListCacheKey,
} from '@common/utils/cache-key.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import ms, { StringValue } from 'ms';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async list(
    data: GetManyCategoriesRequest,
  ): Promise<GetManyCategoriesResponse> {
    const cacheKey = generateCategoryListCacheKey(data);
    const cached =
      await this.cacheManager.get<GetManyCategoriesResponse>(cacheKey);
    if (cached) return cached;

    const categories = await this.categoryRepository.list(data);
    if (categories.totalItems === 0) {
      throw new NotFoundException('Error.NoCategoriesFound');
    }

    this.cacheManager.set(
      cacheKey,
      categories,
      ms(RedisConfiguration.CACHE_CATALOG_TTL as StringValue),
    );
    return categories;
  }

  async findById(data: GetCategoryRequest): Promise<GetCategoryResponse> {
    const cacheKey = generateCategoryByIdCacheKey(data.id);
    const cached = await this.cacheManager.get<GetCategoryResponse>(cacheKey);
    if (cached) return cached;

    const category = await this.categoryRepository.findById(data);
    if (!category) {
      throw new NotFoundException('Error.CategoryNotFound');
    }

    this.cacheManager.set(
      cacheKey,
      category,
      ms(RedisConfiguration.CACHE_CATALOG_TTL as StringValue),
    );
    return category;
  }

  async create({ processId, ...data }: CreateCategoryRequest) {
    try {
      const createdCategory = await this.categoryRepository.create(data);
      return createdCategory;
    } catch (error) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.CategoryAlreadyExists');
      }
    }
  }

  async update({ processId, ...data }: UpdateCategoryRequest) {
    try {
      const updatedCategory = await this.categoryRepository.update(data);
      this.cacheManager.del(generateCategoryByIdCacheKey(updatedCategory.id));
      return updatedCategory;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.CategoryNotFound');
      }
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.CategoryAlreadyExists');
      }
      throw error;
    }
  }

  async delete({ processId, ...data }: DeleteCategoryRequest) {
    try {
      const deletedCategory = await this.categoryRepository.delete(data, false);
      this.cacheManager.del(generateCategoryByIdCacheKey(deletedCategory.id));
      return deletedCategory;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.CategoryNotFound');
      }
      throw error;
    }
  }
}
