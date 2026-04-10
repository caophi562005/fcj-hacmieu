import { Global, Module } from '@nestjs/common';
import { PermissionGrpcController } from './controllers/permission-grpc.controller';
import { PermissionRepository } from './repositories/permission.repository';
import { PermissionService } from './services/permission.service';

@Global()
@Module({
  controllers: [PermissionGrpcController],
  providers: [PermissionRepository, PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
