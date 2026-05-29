import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthConfiguration } from '@common/configurations/auth.config';
import { BaseConfiguration } from '@common/configurations/base.config';
import { RedisConfiguration } from '@common/configurations/redis.config';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import { GroupValues } from '@common/constants/user.constant';
import {
  IAM_SERVICE_PACKAGE_NAME,
  USER_MODULE_SERVICE_NAME,
  UserModuleClient,
} from '@common/interfaces/proto-types/iam';
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
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import ms, { StringValue } from 'ms';
import { MerchantRepository } from '../repositories/merchant.repository';

const cognitoClient = new CognitoIdentityProviderClient({
  region: BaseConfiguration.AWS_REGION,
});

@Injectable()
export class MerchantService implements OnModuleInit {
  private readonly logger = new Logger(MerchantService.name);
  private userModule!: UserModuleClient;

  constructor(
    private readonly merchantRepository: MerchantRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(IAM_SERVICE_PACKAGE_NAME) private iamClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userModule = this.iamClient.getService<UserModuleClient>(
      USER_MODULE_SERVICE_NAME,
    );
  }

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

  private async syncUserGroup(userId: string) {
    const user = await firstValueFrom(this.userModule.getUser({ id: userId }));
    const groups = user.group || [];
    if (!groups.includes(GroupValues.SELLER)) {
      groups.push(GroupValues.SELLER);
      await firstValueFrom(
        this.userModule.updateUser({
          id: userId,
          group: groups,
        }),
      );
    }
    return user;
  }

  async update({
    processId,
    ...data
  }: UpdateMerchantRequest): Promise<MerchantResponse> {
    try {
      const updatedMerchant = await this.merchantRepository.update(data);
      this.cacheManager.del(generateMerchantByIdCacheKey(updatedMerchant.id));

      // Khi admin approve merchant → set custom:merchant_id và thêm user vào group SELLER
      if (data.approvalStatus === 'APPROVED' && updatedMerchant.userId) {
        const userId = updatedMerchant.userId;
        const userPoolId = AuthConfiguration.USER_POOL_ID;

        try {
          const user = await this.syncUserGroup(userId);
          const cognitoUsername = user.username || userId;

          await cognitoClient.send(
            new AdminUpdateUserAttributesCommand({
              UserPoolId: userPoolId,
              Username: cognitoUsername,
              UserAttributes: [
                { Name: 'custom:merchant_id', Value: updatedMerchant.id },
              ],
            }),
          );
        } catch (error: any) {
          this.logger.error(
            `Failed to update Cognito/IAM for user ${userId}: ${error?.message}`,
            error?.stack,
          );
        }
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

