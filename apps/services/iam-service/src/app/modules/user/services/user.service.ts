import {
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthConfiguration } from '@common/configurations/auth.config';
import { BaseConfiguration } from '@common/configurations/base.config';
import { RedisConfiguration } from '@common/configurations/redis.config';
import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateUserRequest,
  GetManyUsersRequest,
  GetManyUsersResponse,
  GetUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '@common/interfaces/models/iam';
import { generateUserCacheKey } from '@common/utils/cache-key.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import ms, { StringValue } from 'ms';
import { UserRepository } from '../repositories/user.repository';

const cognitoClient = new CognitoIdentityProviderClient({
  region: BaseConfiguration.AWS_REGION,
});

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async find(data: GetUserRequest): Promise<UserResponse> {
    const cacheKey = generateUserCacheKey(data.id);
    const cacheData = await this.cacheManager.get<UserResponse>(cacheKey);
    if (cacheData) {
      return cacheData;
    }

    const user = await this.userRepository.find(data);

    if (!user) {
      throw new NotFoundException('Error.UserNotFound');
    }
    this.cacheManager.set(
      cacheKey,
      user,
      ms(RedisConfiguration.CACHE_USER_TTL as StringValue),
    );

    return user;
  }

  async list(data: GetManyUsersRequest): Promise<GetManyUsersResponse> {
    const users = await this.userRepository.list(data);
    if (users.totalItems === 0) {
      throw new NotFoundException('Error.UsersNotFound');
    }
    return users;
  }

  async create(data: CreateUserRequest): Promise<UserResponse> {
    return this.userRepository.create(data);
  }

  async update({
    processId,
    ...data
  }: UpdateUserRequest): Promise<UserResponse> {
    try {
      if (data.group && data.group.length > 0) {
        const oldUser = await this.userRepository.find({ id: data.id });
        if (oldUser) {
          const oldGroups = oldUser.group || [];
          const newGroups = data.group;

          const groupsToAdd = newGroups.filter((g) => !oldGroups.includes(g));
          const groupsToRemove = oldGroups.filter(
            (g) => !newGroups.includes(g),
          );

          console.log('groupsToAdd: ', groupsToAdd);
          console.log('groupsToRemove: ', groupsToRemove);

          const cognitoPromises: Promise<any>[] = [];

          for (const group of groupsToAdd) {
            cognitoPromises.push(
              cognitoClient.send(
                new AdminAddUserToGroupCommand({
                  UserPoolId: AuthConfiguration.USER_POOL_ID,
                  Username: oldUser.username || oldUser.id,
                  GroupName: group,
                }),
              ),
            );
          }

          for (const group of groupsToRemove) {
            cognitoPromises.push(
              cognitoClient.send(
                new AdminRemoveUserFromGroupCommand({
                  UserPoolId: AuthConfiguration.USER_POOL_ID,
                  Username: oldUser.username || oldUser.id,
                  GroupName: group,
                }),
              ),
            );
          }

          if (cognitoPromises.length > 0) {
            await Promise.all(cognitoPromises).catch((error) => {
              this.logger.error(
                `Failed to sync groups to Cognito for user ${oldUser.id}: ${error?.message}`,
                error?.stack,
              );
            });
          }
        }
      }

      const user = await this.userRepository.update(data);
      this.cacheManager.del(generateUserCacheKey(user.id));
      return user;
    } catch (error: any) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.User.NotFound');
      }

      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.User.AlreadyExists');
      }

      throw error;
    }
  }
}
