import {
  AUTH_MODULE_SERVICE_NAME,
  AuthModuleClient,
  ChangePasswordRequest,
  ExchangeCodeRequest,
  IAM_SERVICE_PACKAGE_NAME,
  LogoutCurrentSessionRequest,
  RefreshSessionRequest,
  ValidateTokenRequest,
} from '@common/interfaces/proto-types/iam';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private authModule!: AuthModuleClient;

  constructor(
    @Inject(IAM_SERVICE_PACKAGE_NAME)
    private iamClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authModule = this.iamClient.getService<AuthModuleClient>(
      AUTH_MODULE_SERVICE_NAME,
    );
  }

  async exchangeCode(data: ExchangeCodeRequest) {
    return firstValueFrom(this.authModule.exchangeCode(data));
  }

  async refreshSession(data: RefreshSessionRequest) {
    return firstValueFrom(this.authModule.refreshSession(data));
  }

  async logout(data: LogoutCurrentSessionRequest) {
    return firstValueFrom(this.authModule.logoutCurrentSession(data));
  }

  async changePassword(data: ChangePasswordRequest) {
    return firstValueFrom(this.authModule.changePassword(data));
  }

  async validateToken(data: ValidateTokenRequest) {
    return firstValueFrom(this.authModule.validateToken(data));
  }
}
