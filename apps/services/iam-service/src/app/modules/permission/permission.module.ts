import { Module } from '@nestjs/common';
import { PermissionGrpcController } from './controllers/permission-grpc.controller';
import { RoleGrpcController } from './controllers/role-grpc.controller';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';

@Module({
  controllers: [PermissionGrpcController, RoleGrpcController],
  providers: [
    PermissionRepository,
    PermissionService,
    RoleRepository,
    RoleService,
  ],
})
export class PermissionModule {}
