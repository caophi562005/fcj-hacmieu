import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CountResponse,
  CreateManyPermissionsRequest,
  CreatePermissionRequest,
  DeleteManyPermissionsRequest,
  DeletePermissionRequest,
  GetAllPermissionsRequest,
  GetAllPermissionsResponse,
  GetManyPermissionsRequest,
  GetManyPermissionsResponse,
  GetPermissionRequest,
  GetPermissionResponse,
  UpdatePermissionRequest,
} from '@common/interfaces/models/iam';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PermissionService } from '../services/permission.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class PermissionGrpcController {
  constructor(private readonly permissionService: PermissionService) {}

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'GetManyPermissions')
  getManyPermissions(
    data: GetManyPermissionsRequest,
  ): Promise<GetManyPermissionsResponse> {
    return this.permissionService.list(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'GetAllPermissions')
  getAllPermissions(
    data: GetAllPermissionsRequest,
  ): Promise<GetAllPermissionsResponse> {
    return this.permissionService.listAll(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'GetPermission')
  getPermission(
    data: GetPermissionRequest,
  ): Promise<GetPermissionResponse | null> {
    return this.permissionService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'CreatePermission')
  createPermission(
    data: CreatePermissionRequest,
  ): Promise<GetPermissionResponse> {
    return this.permissionService.create(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'CreateManyPermissions')
  createManyPermissions(
    data: CreateManyPermissionsRequest,
  ): Promise<CountResponse> {
    return this.permissionService.createMany(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'UpdatePermission')
  updatePermission(
    data: UpdatePermissionRequest,
  ): Promise<GetPermissionResponse> {
    return this.permissionService.update(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'DeletePermission')
  deletePermission(
    data: DeletePermissionRequest,
  ): Promise<GetPermissionResponse> {
    return this.permissionService.delete(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'DeleteManyPermissions')
  deleteManyPermissions(
    data: DeleteManyPermissionsRequest,
  ): Promise<CountResponse> {
    return this.permissionService.deleteMany(data);
  }
}
