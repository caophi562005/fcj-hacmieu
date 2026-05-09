import {
  GetManyUsersRequest,
  GetManyUsersResponse,
  GetUserRequest,
  IAM_SERVICE_PACKAGE_NAME,
  UpdateUserRequest,
  USER_MODULE_SERVICE_NAME,
  UserModuleClient,
  UserResponse,
} from '@common/interfaces/proto-types/iam';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserService implements OnModuleInit {
  private userModule!: UserModuleClient;

  constructor(
    @Inject(IAM_SERVICE_PACKAGE_NAME)
    private readonly iamClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userModule = this.iamClient.getService<UserModuleClient>(
      USER_MODULE_SERVICE_NAME,
    );
  }

  async getManyUsers(data: GetManyUsersRequest): Promise<GetManyUsersResponse> {
    return firstValueFrom(this.userModule.getManyUsers(data));
  }

  async getUser(data: GetUserRequest): Promise<UserResponse> {
    return firstValueFrom(this.userModule.getUser(data));
  }

  async updateUser(data: UpdateUserRequest): Promise<UserResponse> {
    return firstValueFrom(this.userModule.updateUser(data));
  }
}
