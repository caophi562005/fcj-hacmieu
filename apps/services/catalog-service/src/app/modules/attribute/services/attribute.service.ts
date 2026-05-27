import { RedisConfiguration } from '@common/configurations/redis.config';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  AttributeResponse,
  CreateAttributeRequest,
  DeleteAttributeRequest,
  GetAttributeResponse,
  GetManyAttributesResponse,
  UpdateAttributeRequest,
} from '@common/interfaces/models/catalog';
import {
  generateAttributeByIdCacheKey,
  generateAttributeListCacheKey,
} from '@common/utils/cache-key.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import ms, { StringValue } from 'ms';
import { AttributeRepository } from '../repositories/attribute.repository';

@Injectable()
export class AttributeService {
  constructor(
    private readonly attributeRepository: AttributeRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async list(data: any): Promise<GetManyAttributesResponse> {
    const cacheKey = generateAttributeListCacheKey(data);
    const cached =
      await this.cacheManager.get<GetManyAttributesResponse>(cacheKey);
    if (cached) return cached;

    const attributes = await this.attributeRepository.list(data);
    if (attributes.totalItems === 0) {
      throw new NotFoundException('Error.NoAttributesFound');
    }

    this.cacheManager.set(
      cacheKey,
      attributes,
      ms(RedisConfiguration.CACHE_CATALOG_TTL as StringValue),
    );
    return attributes;
  }

  async findById(data: any): Promise<GetAttributeResponse> {
    const cacheKey = generateAttributeByIdCacheKey(data.id);
    const cached = await this.cacheManager.get<GetAttributeResponse>(cacheKey);
    if (cached) return cached;

    const attribute = await this.attributeRepository.findById(data);
    if (!attribute) {
      throw new NotFoundException('Error.AttributeNotFound');
    }

    this.cacheManager.set(
      cacheKey,
      attribute,
      ms(RedisConfiguration.CACHE_CATALOG_TTL as StringValue),
    );
    return attribute;
  }

  async create({
    processId,
    ...data
  }: CreateAttributeRequest): Promise<AttributeResponse> {
    try {
      const createdAttribute = await this.attributeRepository.create(data);
      return createdAttribute;
    } catch (error) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictException('Error.AttributeAlreadyExists');
      }
      throw error;
    }
  }

  async update({
    processId,
    ...data
  }: UpdateAttributeRequest): Promise<AttributeResponse> {
    try {
      const updatedAttribute = await this.attributeRepository.update(data);
      this.cacheManager.del(generateAttributeByIdCacheKey(updatedAttribute.id));
      return updatedAttribute;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.AttributeNotFound');
      }
      throw error;
    }
  }

  async delete({
    processId,
    ...data
  }: DeleteAttributeRequest): Promise<AttributeResponse> {
    try {
      const deletedAttribute = await this.attributeRepository.delete(
        data,
        false,
      );
      this.cacheManager.del(generateAttributeByIdCacheKey(deletedAttribute.id));
      return deletedAttribute;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.AttributeNotFound');
      }
      throw error;
    }
  }
}
