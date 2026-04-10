import { RedisConfiguration } from '@common/configurations/redis.config';
import { MetadataKeys } from '@common/constants/common.constant';
import {
  AUTH_MODULE_SERVICE_NAME,
  AuthModuleClient,
  IAM_SERVICE_PACKAGE_NAME,
  ValidateTokenResponse,
} from '@common/interfaces/proto-types/iam';
import { generateTokenCacheKey } from '@common/utils/cache-key.util';
import { getAccessToken } from '@common/utils/get-access.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { keyBy } from 'lodash';
import ms, { StringValue } from 'ms';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AccessTokenGuard implements CanActivate, OnModuleInit {
  private authModule!: AuthModuleClient;

  constructor(
    @Inject(IAM_SERVICE_PACKAGE_NAME)
    private iamClient: ClientGrpc,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  onModuleInit() {
    this.authModule = this.iamClient.getService<AuthModuleClient>(
      AUTH_MODULE_SERVICE_NAME,
    );
  }

  private async extractAndValidateToken(
    request: any,
  ): Promise<ValidateTokenResponse> {
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      throw new UnauthorizedException('Error.AccessTokenNotFound');
    }

    const cacheKey = generateTokenCacheKey(accessToken);

    const cacheData =
      await this.cacheManager.get<ValidateTokenResponse>(cacheKey);

    if (cacheData) {
      request[MetadataKeys.USER_DATA] = cacheData;
      return cacheData;
    }

    const processId = request[MetadataKeys.PROCESS_ID];
    try {
      const decodedAccessToken = await firstValueFrom(
        this.authModule.validateToken({
          accessToken,
          processId,
        }),
      );

      if (!decodedAccessToken.isValid) {
        throw new UnauthorizedException('Error.InvalidAccessToken');
      }
      this.cacheManager.set(
        cacheKey,
        decodedAccessToken,
        ms(RedisConfiguration.CACHE_TOKEN_TTL as StringValue),
      );
      request[MetadataKeys.USER_DATA] = decodedAccessToken;
      return decodedAccessToken;
    } catch (e) {
      throw new UnauthorizedException('Error.InvalidAccessToken');
    }
  }

  private async validateUserPermission(
    decodedAccessToken: ValidateTokenResponse,
    request: any,
  ): Promise<void> {
    const path = request.route.path;
    const method = request.method;

    const permissionObject = keyBy(
      decodedAccessToken.permissions,
      (permission: any) => `${permission.path}:${permission.method}`,
    );

    // Kiểm tra quyển truy cập
    const canAccess = permissionObject[`${path}:${method}`];
    if (!canAccess) {
      throw new ForbiddenException('Error.AccessDenied');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    //Extract và validate token
    const decodedAccessToken = await this.extractAndValidateToken(request);

    //Check user permission
    await this.validateUserPermission(decodedAccessToken, request);

    return true;
  }
}
