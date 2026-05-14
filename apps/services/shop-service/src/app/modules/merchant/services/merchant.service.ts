import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthConfiguration } from '@common/configurations/auth.config';
import { BaseConfiguration } from '@common/configurations/base.config';
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
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MerchantRepository } from '../repositories/merchant.repository';

const cognitoClient = new CognitoIdentityProviderClient({
  region: BaseConfiguration.AWS_REGION,
});

@Injectable()
export class MerchantService {
  private readonly logger = new Logger(MerchantService.name);

  constructor(private readonly merchantRepository: MerchantRepository) {}

  async list(data: GetManyMerchantsRequest): Promise<GetManyMerchantsResponse> {
    const merchants = await this.merchantRepository.list(data);
    if (merchants.totalItems === 0) {
      throw new NotFoundException('Error.MerchantNotFound');
    }
    return merchants;
  }

  async findById(data: GetMerchantRequest): Promise<MerchantResponse> {
    const merchant = await this.merchantRepository.findById(data);
    if (!merchant) {
      throw new NotFoundException('Error.MerchantNotFound');
    }
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
      return deletedMerchant;
    } catch (error: any) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.MerchantNotFound');
      }
      throw error;
    }
  }
}
