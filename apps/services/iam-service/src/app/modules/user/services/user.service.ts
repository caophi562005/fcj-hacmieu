import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CheckParticipantExistsRequest,
  CheckParticipantExistsResponse,
  CreateUserRequest,
  GetManyInformationUsersRequest,
  GetManyInformationUsersResponse,
  GetManyUsersRequest,
  GetManyUsersResponse,
  GetUserRequest,
  UpdateRoleRequest,
  UpdateUserRequest,
  UserResponse,
} from '@common/interfaces/models/user-access';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async find(data: GetUserRequest): Promise<UserResponse> {
    // const cacheKey = generateUserCacheKey(data.id);
    // const cacheData = await this.cacheManager.get<UserResponse>(cacheKey);
    // if (cacheData) {
    //   return cacheData;
    // }

    const user = await this.userRepository.find(data);

    if (!user) {
      throw new NotFoundException('Error.UserNotFound');
    }
    // this.cacheManager.set(
    //   cacheKey,
    //   user,
    //   ms(RedisConfiguration.CACHE_USER_TTL as StringValue)
    // );

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
      const user = await this.userRepository.update(data);
      // this.cacheManager.del(generateUserCacheKey(user.id));
      return user;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.UserNotFound');
      }

      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.UserAlreadyExists');
      }

      throw error;
    }
  }

  async updateRole({ processId, ...data }: UpdateRoleRequest) {
    try {
      const user = await this.userRepository.update(data);
      // this.cacheManager.del(generateUserCacheKey(user.id));
      return user;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.UserNotFound');
      }

      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.UserAlreadyExists');
      }

      throw error;
    }
  }

  async checkParticipantExists({
    processId,
    ...data
  }: CheckParticipantExistsRequest): Promise<CheckParticipantExistsResponse> {
    const count = await this.userRepository.checkParticipantExists(
      data.participantIds,
    );
    return { count };
  }

  async getManyInformationUsers(
    data: GetManyInformationUsersRequest,
  ): Promise<GetManyInformationUsersResponse> {
    const users = await this.userRepository.getManyInformationUsers(
      data.userIds,
    );

    const userMap: Record<
      string,
      { username: string; avatar: string | undefined }
    > = {};

    users.forEach((user) => {
      userMap[user.id] = {
        username: user.username,
        avatar: user.avatar,
      };
    });

    return { users: userMap };
  }
}
