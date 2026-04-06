import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateRoleRequest,
  DeleteRoleRequest,
  GetManyRolesRequest,
  GetManyRolesResponse,
  GetRoleRequest,
  GetRoleResponse,
  UpdateRoleRequest,
} from '@common/interfaces/models/role/role';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RoleService } from '../services/role.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class RoleGrpcController {
  constructor(private readonly roleService: RoleService) {}

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'GetManyRoles')
  getManyRoles(data: GetManyRolesRequest): Promise<GetManyRolesResponse> {
    return this.roleService.list(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'GetRole')
  getRole(data: GetRoleRequest): Promise<GetRoleResponse | null> {
    return this.roleService.find(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'CreateRole')
  createRole(data: CreateRoleRequest): Promise<GetRoleResponse> {
    return this.roleService.create(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'UpdateRole')
  updateRole(data: UpdateRoleRequest): Promise<GetRoleResponse> {
    return this.roleService.update(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.PERMISSION, 'DeleteRole')
  deleteRole(data: DeleteRoleRequest): Promise<GetRoleResponse> {
    return this.roleService.delete(data);
  }
}
