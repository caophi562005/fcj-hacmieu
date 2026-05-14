import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AuthController } from './controllers/auth.controller';
import { PermissionController } from './controllers/permission.controller';
import { UserController } from './controllers/user.controller';
import { AuthService } from './services/auth.service';
import { PermissionService } from './services/permission.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.IAM_SERVICE)]),
  ],
  controllers: [AuthController, UserController, PermissionController],
  providers: [AuthService, UserService, PermissionService],
})
export class IamModule {}
