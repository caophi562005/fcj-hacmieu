import {
  CountResponse,
  CreateManyPermissionsRequest,
  CreatePermissionRequest,
  CreatePermissionResponse,
  DeleteManyPermissionsRequest,
  GetAllPermissionsRequest,
  GetAllPermissionsResponse,
  GetManyPermissionsRequest,
  GetManyPermissionsResponse,
  IAM_SERVICE_PACKAGE_NAME,
  PERMISSION_MODULE_SERVICE_NAME,
  PermissionModuleClient,
} from '@common/interfaces/proto-types/iam';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PermissionService implements OnModuleInit {
  private permissionModule!: PermissionModuleClient;

  constructor(
    @Inject(IAM_SERVICE_PACKAGE_NAME)
    private readonly iamClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.permissionModule = this.iamClient.getService<PermissionModuleClient>(
      PERMISSION_MODULE_SERVICE_NAME,
    );
  }

  async getManyPermissions(
    data: GetManyPermissionsRequest,
  ): Promise<GetManyPermissionsResponse> {
    return firstValueFrom(this.permissionModule.getManyPermissions(data));
  }

  async getAllPermissions(
    data: GetAllPermissionsRequest,
  ): Promise<GetAllPermissionsResponse> {
    return firstValueFrom(this.permissionModule.getAllPermissions(data));
  }

  async createPermission(
    data: CreatePermissionRequest,
  ): Promise<CreatePermissionResponse> {
    return firstValueFrom(this.permissionModule.createPermission(data));
  }

  async createManyPermissions(
    data: CreateManyPermissionsRequest,
  ): Promise<CountResponse> {
    return firstValueFrom(this.permissionModule.createManyPermissions(data));
  }

  async deleteManyPermissions(
    data: DeleteManyPermissionsRequest,
  ): Promise<CountResponse> {
    return firstValueFrom(this.permissionModule.deleteManyPermissions(data));
  }
}
