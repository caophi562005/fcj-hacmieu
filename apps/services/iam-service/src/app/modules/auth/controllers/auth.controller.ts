import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  ChangePasswordRequest,
  ExchangeTokenRequest,
  LogoutCurrentSessionRequest,
  RefreshSessionRequest,
  ValidateTokenRequest,
} from '@common/interfaces/models/iam';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod(GrpcModuleName.IAM.AUTH, 'ExchangeCode')
  exchangeCode(data: ExchangeTokenRequest) {
    return this.authService.exchangeCode(data.code);
  }

  @GrpcMethod(GrpcModuleName.IAM.AUTH, 'RefreshSession')
  refreshSession(data: RefreshSessionRequest) {
    return this.authService.refreshSession(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.AUTH, 'LogoutCurrentSession')
  logoutCurrentSession(data: LogoutCurrentSessionRequest) {
    return this.authService.logoutCurrentSession(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.AUTH, 'ChangePassword')
  changePassword(data: ChangePasswordRequest) {
    return this.authService.changePassword(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.AUTH, 'ValidateToken')
  validateToken(data: ValidateTokenRequest) {
    return this.authService.validateToken(data);
  }
}
