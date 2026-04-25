import {
  ChangePasswordCommand,
  CognitoIdentityProviderClient,
  GetTokensFromRefreshTokenCommand,
  RevokeTokenCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthConfiguration } from '@common/configurations/auth.config';
import { BaseConfiguration } from '@common/configurations/base.config';
import { GroupType } from '@common/constants/user.constant';
import {
  ChangePasswordRequest,
  ExchangeTokenResponse,
  GetAllPermissionsResponse,
  LogoutCurrentSessionRequest,
  RefreshSessionRequest,
  ValidateTokenRequest,
} from '@common/interfaces/models/iam';
import {
  generateTokenBlacklistKey,
  generateTokenCacheKey,
} from '@common/utils/cache-key.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Cache } from 'cache-manager';
import { PermissionService } from '../../permission/services/permission.service';

const client = new CognitoIdentityProviderClient({
  region: BaseConfiguration.AWS_REGION,
});

@Injectable()
export class AuthService {
  constructor(
    private readonly permissionService: PermissionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async exchangeCode(code: string): Promise<ExchangeTokenResponse> {
    if (!code) {
      throw new BadRequestException('Missing authorization code');
    }

    const form = new URLSearchParams();
    form.append('grant_type', 'authorization_code');
    form.append('code', code);
    form.append('redirect_uri', AuthConfiguration.REDIRECT_URI);

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (AuthConfiguration.CLIENT_SECRET) {
      const basicAuth = Buffer.from(
        `${AuthConfiguration.CLIENT_ID}:${AuthConfiguration.CLIENT_SECRET}`,
      ).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    } else {
      form.append('client_id', AuthConfiguration.CLIENT_ID);
    }

    const response = await fetch(
      `${AuthConfiguration.COGNITO_DOMAIN}/oauth2/token`,
      {
        method: 'POST',
        headers,
        body: form.toString(),
      },
    );

    const raw = await response.text();

    let data: Record<string, any>;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    if (!response.ok) {
      throw new BadRequestException({
        message: 'Cognito token exchange failed',
      });
    }

    if (!data.access_token) {
      throw new InternalServerErrorException(
        'Invalid token response from Cognito: Missing access_token',
      );
    }

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    } as ExchangeTokenResponse;
  }

  async refreshSession(data: RefreshSessionRequest) {
    const command = new GetTokensFromRefreshTokenCommand({
      ClientId: AuthConfiguration.CLIENT_ID,
      ClientSecret: AuthConfiguration.CLIENT_SECRET,
      RefreshToken: data.refreshToken,
    });

    const res = await client.send(command);

    return {
      accessToken: res.AuthenticationResult?.AccessToken,
      idToken: res.AuthenticationResult?.IdToken,
      refreshToken: res.AuthenticationResult?.RefreshToken,
      expiresIn: res.AuthenticationResult?.ExpiresIn,
      tokenType: res.AuthenticationResult?.TokenType,
    };
  }

  async logoutCurrentSession(data: LogoutCurrentSessionRequest) {
    const command = new RevokeTokenCommand({
      ClientId: AuthConfiguration.CLIENT_ID,
      ClientSecret: AuthConfiguration.CLIENT_SECRET,
      Token: data.refreshToken,
    });

    await client.send(command);

    // Decode JWT để lấy exp (không cần verify lại)
    const [, payloadB64] = data.accessToken.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    const remainingTtl = Math.max(0, payload.exp * 1000 - Date.now());

    // Xóa cache token
    await this.cacheManager.del(generateTokenCacheKey(data.accessToken));

    // Thêm vào blacklist với TTL = thời gian còn lại của token
    if (remainingTtl > 0) {
      await this.cacheManager.set(
        generateTokenBlacklistKey(data.accessToken),
        true,
        remainingTtl,
      );
    }

    return { message: 'Logout successfully' };
  }

  async changePassword(data: ChangePasswordRequest) {
    const command = new ChangePasswordCommand({
      PreviousPassword: data.previousPassword,
      ProposedPassword: data.proposedPassword,
      AccessToken: data.accessToken,
    });
    const res = await client.send(command);
    if (res.$metadata.httpStatusCode !== 200) {
      throw new InternalServerErrorException('Failed to change password');
    }
    return {
      message: 'Password changed successfully',
    };
  }

  async validateToken(data: ValidateTokenRequest) {
    // Check blacklist trước
    const isBlacklisted = await this.cacheManager.get(
      generateTokenBlacklistKey(data.accessToken),
    );
    if (isBlacklisted) {
      return {
        isValid: false,
        userId: '',
        username: '',
        groups: [],
        permissions: [],
      };
    }

    const verifier = CognitoJwtVerifier.create({
      userPoolId: AuthConfiguration.USER_POOL_ID,
      tokenUse: 'access',
      clientId: AuthConfiguration.CLIENT_ID,
    });

    const payload = await verifier.verify(data.accessToken);

    if (!payload) {
      return {
        isValid: false,
        userId: '',
        username: '',
        groups: [],
        permissions: [],
      };
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return {
        isValid: false,
        userId: payload.sub,
        username: payload.username,
        groups: [],
        permissions: [],
      };
    }

    const groups = Array.from(
      new Set((payload['cognito:groups'] as string[] | undefined) ?? []),
    );

    const permissionsByGroup: GetAllPermissionsResponse[] = await Promise.all(
      groups.map((group) =>
        this.permissionService.listAll({
          group: group as GroupType,
        }),
      ),
    );

    const uniquePermissions = Array.from(
      new Map(
        permissionsByGroup
          .flatMap((item) => item.permissions)
          .map((permission) => [
            `${permission.path}:${permission.method}`,
            permission,
          ]),
      ).values(),
    );

    return {
      isValid: true,
      userId: payload.sub,
      username: payload.username,
      groups,
      permissions: uniquePermissions,
    };
  }
}
