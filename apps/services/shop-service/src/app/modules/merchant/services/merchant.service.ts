import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthConfiguration } from '@common/configurations/auth.config';
import { BaseConfiguration } from '@common/configurations/base.config';
import { RedisConfiguration } from '@common/configurations/redis.config';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateMerchantRequest,
  DeleteMerchantRequest,
  GetManyMerchantsRequest,
  GetManyMerchantsResponse,
  GetMerchantRequest,
  MerchantResponse,
  UpdateMerchantRequest,
} from '@common/interfaces/models/shop';
import { generateMerchantByIdCacheKey } from '@common/utils/cache-key.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import ms, { StringValue } from 'ms';
import { MerchantRepository } from '../repositories/merchant.repository';

const cognitoClient = new CognitoIdentityProviderClient({
  region: BaseConfiguration.AWS_REGION,
});

@Injectable()
export class MerchantService {
  private readonly logger = new Logger(MerchantService.name);

  constructor(
    private readonly merchantRepository: MerchantRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async list(data: GetManyMerchantsRequest): Promise<GetManyMerchantsResponse> {
    const merchants = await this.merchantRepository.list(data);
    if (merchants.totalItems === 0) {
      throw new NotFoundException('Error.MerchantNotFound');
    }
    return merchants;
  }

  async findById(data: GetMerchantRequest): Promise<MerchantResponse> {
    const cacheKey = generateMerchantByIdCacheKey(data.id);
    const cached = await this.cacheManager.get<MerchantResponse>(cacheKey);
    if (cached) return cached;

    const merchant = await this.merchantRepository.findById(data);
    if (!merchant) {
      throw new NotFoundException('Error.MerchantNotFound');
    }

    this.cacheManager.set(
      cacheKey,
      merchant,
      ms(RedisConfiguration.CACHE_SHOP_TTL as StringValue),
    );
    return merchant;
  }

  async create({
    processId,
    ...data
  }: CreateMerchantRequest): Promise<MerchantResponse> {
    try {
      const createdMerchant = await this.merchantRepository.create(data);
      return createdMerchant;
    } catch (error: any) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.MerchantAlreadyExists');
      }
      throw error;
    }
  }

  async update({
    processId,
    ...data
  }: UpdateMerchantRequest): Promise<MerchantResponse> {
    try {
      const updatedMerchant = await this.merchantRepository.update(data);
      this.cacheManager.del(generateMerchantByIdCacheKey(updatedMerchant.id));

      // Khi admin approve merchant → set custom:merchant_id trên Cognito
      if (data.approvalStatus === 'APPROVED' && updatedMerchant.userId) {
        cognitoClient
          .send(
            new AdminUpdateUserAttributesCommand({
              UserPoolId: AuthConfiguration.USER_POOL_ID,
              Username: updatedMerchant.userId,
              UserAttributes: [
                { Name: 'custom:merchant_id', Value: updatedMerchant.id },
              ],
            }),
          )
          .catch((error) => {
            this.logger.warn(
              `Failed to set custom:merchant_id for user ${updatedMerchant.userId}:`,
              error?.message,
            );
          });
      }

      return updatedMerchant;
    } catch (error: any) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.MerchantNotFound');
      }
      throw error;
    }
  }

  async delete(data: DeleteMerchantRequest): Promise<MerchantResponse> {
    try {
      const deletedMerchant = await this.merchantRepository.delete(data, false);
      this.cacheManager.del(generateMerchantByIdCacheKey(deletedMerchant.id));
      return deletedMerchant;
    } catch (error: any) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.MerchantNotFound');
      }
      throw error;
    }
  }
}

