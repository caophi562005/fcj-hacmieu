import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateUserRequest,
  GetManyUsersRequest,
  GetUserRequest,
  UpdateUserRequest,
} from '@common/interfaces/models/iam';
import { Controller, NotFoundException, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../services/user.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class UserGrpcController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(GrpcModuleName.IAM.USER, 'GetUser')
  async getUser(data: GetUserRequest) {
    const user = await this.userService.find(data);
    if (!user) {
      throw new NotFoundException('Error.UserNotFound');
    }
    return user;
  }

  @GrpcMethod(GrpcModuleName.IAM.USER, 'GetManyUsers')
  getManyUsers(data: GetManyUsersRequest) {
    return this.userService.list(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.USER, 'CreateUser')
  createUser(data: CreateUserRequest) {
    return this.userService.create(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.USER, 'UpdateUser')
  updateUser(data: UpdateUserRequest) {
    return this.userService.update(data);
  }
}
