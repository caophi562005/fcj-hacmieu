import {
  ChangePasswordCommand,
  CognitoIdentityProviderClient,
  GetTokensFromRefreshTokenCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthConfiguration } from '@common/configurations/auth.config';
import { BaseConfiguration } from '@common/configurations/base.config';
import { GroupType } from '@common/constants/user.constant';
import {
  ChangePasswordRequest,
  GetAllPermissionsResponse,
  RefreshSessionRequest,
  ValidateTokenRequest,
} from '@common/interfaces/models/iam';
import { generateTokenBlacklistKey } from '@common/utils/cache-key.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
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
