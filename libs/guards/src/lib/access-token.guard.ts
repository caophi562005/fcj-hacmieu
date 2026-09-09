import { RedisConfiguration } from '@common/configurations/redis.config';
import { MetadataKeys } from '@common/constants/common.constant';
import {
  AUTH_MODULE_SERVICE_NAME,
  AuthModuleClient,
  IAM_SERVICE_PACKAGE_NAME,
  ValidateTokenResponse,
} from '@common/interfaces/proto-types/iam';
import { generateTokenCacheKey } from '@common/utils/cache-key.util';
import { getAccessToken, getIdToken } from '@common/utils/get-access.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  OnModuleInit,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { keyBy } from 'lodash';
import ms, { StringValue } from 'ms';
import { firstValueFrom } from 'rxjs';
import { GroupValues } from '@common/constants/user.constant';

@Injectable()
export class AccessTokenGuard implements CanActivate, OnModuleInit {
  private authModule!: AuthModuleClient;

  constructor(
    @Inject(IAM_SERVICE_PACKAGE_NAME)
    private iamClient: ClientGrpc,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Optional() @Inject('APP_TYPE') private appType?: string,
  ) {}

  onModuleInit() {
    this.authModule = this.iamClient.getService<AuthModuleClient>(
      AUTH_MODULE_SERVICE_NAME,
    );
  }

  private async extractAndValidateToken(
    request: any,
    refresh = false,
  ): Promise<{ token: ValidateTokenResponse; fromCache: boolean }> {
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      throw new UnauthorizedException('Error.AccessTokenNotFound');
    }
    const idToken = getIdToken(request);
    if (!idToken) {
      throw new UnauthorizedException('Error.IdTokenNotFound');
    }

    const cacheKey = generateTokenCacheKey(accessToken);

    const cacheData = refresh
      ? undefined
      : await this.cacheManager.get<ValidateTokenResponse>(cacheKey);

    if (cacheData) {
      request[MetadataKeys.USER_DATA] = cacheData;
      return { token: cacheData, fromCache: true };
    }

    const processId = request[MetadataKeys.PROCESS_ID];
    try {
      const decodedAccessToken = await firstValueFrom(
        this.authModule.validateToken({
          accessToken,
          idToken,
          processId,
          type: this.appType || GroupValues.CUSTOMER,
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
      return { token: decodedAccessToken, fromCache: false };
    } catch (e) {
      throw new UnauthorizedException('Error.InvalidAccessToken');
    }
  }

  private async validateUserPermission(
    decodedAccessToken: ValidateTokenResponse,
    request: any,
  ): Promise<void> {
    const method = request.method;

    const permissionObject = keyBy(
      decodedAccessToken.permissions,
      (permission: any) => `${permission.path}:${permission.method}`,
    );

    // Kiểm tra quyển truy cập
    const normalizePath = (value?: string): string | undefined => {
      if (!value) return undefined;
      const pathname = value.split('?')[0];
      const normalized = `/${pathname}`.replace(/\/+/g, '/');
      return normalized.length > 1 && normalized.endsWith('/')
        ? normalized.slice(0, -1)
        : normalized;
    };

    const routePath = normalizePath(request.route?.path);
    const baseUrl = normalizePath(request.baseUrl);
    const mountedRoutePath =
      baseUrl && routePath
        ? normalizePath(`${baseUrl}/${routePath.replace(/^\//, '')}`)
        : undefined;
    const pathCandidates = Array.from(
      new Set(
        [
          routePath,
          mountedRoutePath,
          normalizePath(request.path),
          normalizePath(request.originalUrl),
        ].filter((path): path is string => Boolean(path)),
      ),
    );

    const canAccess = pathCandidates.some((path) =>
      Boolean(permissionObject[`${path}:${method}`]),
    );
    if (!canAccess) {
      throw new ForbiddenException('Error.AccessDenied');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    //Extract và validate token
    const cached = await this.extractAndValidateToken(request);
    let token = cached.token;

    //Check user permission
    try {
      await this.validateUserPermission(token, request);
    } catch (error) {
      if (!cached.fromCache || !(error instanceof ForbiddenException))
        throw error;

      // A route may have been added since the token's permissions were cached.
      // Revalidate both tokens through IAM before deciding to deny access.
      ({ token } = await this.extractAndValidateToken(request, true));
      await this.validateUserPermission(token, request);
    }

    return true;
  }
}
