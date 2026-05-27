import {
  AdminAddUserToGroupCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthConfiguration } from '@common/configurations/auth.config';
import { BaseConfiguration } from '@common/configurations/base.config';
import { RedisConfiguration } from '@common/configurations/redis.config';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import { GroupValues } from '@common/constants/user.constant';
import {
  CreateShopRequest,
  DeleteShopRequest,
  GetManyShopsRequest,
  GetManyShopsResponse,
  GetShopRequest,
  ShopResponse,
  UpdateShopRequest,
} from '@common/interfaces/models/shop';
import { generateShopByIdCacheKey } from '@common/utils/cache-key.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import ms, { StringValue } from 'ms';
import { MerchantRepository } from '../../merchant/repositories/merchant.repository';
import { ShopRepository } from '../repositories/shop.repository';

const cognitoClient = new CognitoIdentityProviderClient({
  region: BaseConfiguration.AWS_REGION,
});

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(
    private readonly shopRepository: ShopRepository,
    private readonly merchantRepository: MerchantRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async list(data: GetManyShopsRequest): Promise<GetManyShopsResponse> {
    const shops = await this.shopRepository.list(data);
    if (shops.totalItems === 0) {
      throw new NotFoundException('Error.ShopNotFound');
    }
    return shops;
  }

  async findById(data: GetShopRequest): Promise<ShopResponse> {
    const cacheKey = generateShopByIdCacheKey(data.id);
    const cached = await this.cacheManager.get<ShopResponse>(cacheKey);
    if (cached) return cached;

    const shop = await this.shopRepository.findById(data);
    if (!shop) {
      throw new NotFoundException('Error.ShopNotFound');
    }

    this.cacheManager.set(
      cacheKey,
      shop,
      ms(RedisConfiguration.CACHE_SHOP_TTL as StringValue),
    );
    return shop;
  }

  async create({
    processId,
    ...data
  }: CreateShopRequest): Promise<ShopResponse> {
    try {
      const merchant = await this.merchantRepository.findById({
        id: data.merchantId,
      });
      if (!merchant) {
        throw new NotFoundException('Error.MerchantNotFound');
      }
      if (merchant.approvalStatus !== 'APPROVED') {
        throw new BadRequestException('Error.MerchantNotApproved');
      }

      const createdShop = await this.shopRepository.create(data);

      // Fire-and-forget: thêm user vào Cognito group SELLER + set custom:shop_id
      if (merchant.userId) {
        const userId = merchant.userId;
        const userPoolId = AuthConfiguration.USER_POOL_ID;

        Promise.all([
          cognitoClient.send(
            new AdminAddUserToGroupCommand({
              UserPoolId: userPoolId,
              Username: userId,
              GroupName: GroupValues.SELLER,
            }),
          ),
          cognitoClient.send(
            new AdminUpdateUserAttributesCommand({
              UserPoolId: userPoolId,
              Username: userId,
              UserAttributes: [
                { Name: 'custom:shop_id', Value: createdShop.id },
              ],
            }),
          ),
        ]).catch((error) => {
          this.logger.warn(
            `Failed to update Cognito for user ${userId}:`,
            error?.message,
          );
        });
      }

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
      this.cacheManager.del(generateShopByIdCacheKey(updatedShop.id));
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
      this.cacheManager.del(generateShopByIdCacheKey(deletedShop.id));
      return deletedShop;
    } catch (error: any) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ShopNotFound');
      }
      throw error;
    }
  }
}

