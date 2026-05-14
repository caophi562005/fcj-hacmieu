import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.IAM_SERVICE)]),
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService],
})
export class IamModule {}
