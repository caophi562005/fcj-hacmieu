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
    const accessVerifier = CognitoJwtVerifier.create({
      userPoolId: AuthConfiguration.USER_POOL_ID,
      tokenUse: 'access',
      clientId: AuthConfiguration.CLIENT_ID,
    });
    const idVerifier = CognitoJwtVerifier.create({
      userPoolId: AuthConfiguration.USER_POOL_ID,
      tokenUse: 'id',
      clientId: AuthConfiguration.CLIENT_ID,
    });

    const invalidResponse = {
      isValid: false,
      userId: '',
      username: '',
      groups: [],
      permissions: [],
      shopId: '',
      merchantId: '',
    };

    let accessPayload;
    let idPayload;
    try {
      [accessPayload, idPayload] = await Promise.all([
        accessVerifier.verify(data.accessToken),
        idVerifier.verify(data.idToken),
      ]);
    } catch {
      return invalidResponse;
    }

    if (!accessPayload || !idPayload) {
      return invalidResponse;
    }

    // Bắt buộc 2 token cùng 1 user (chống ghép token chéo)
    if (accessPayload.sub !== idPayload.sub) {
      return invalidResponse;
    }

    const now = Date.now();
    if (
      (accessPayload.exp && accessPayload.exp * 1000 < now) ||
      (idPayload.exp && idPayload.exp * 1000 < now)
    ) {
      return {
        ...invalidResponse,
        userId: accessPayload.sub,
        username: accessPayload.username,
      };
    }

    const groups = Array.from(
      new Set((accessPayload['cognito:groups'] as string[] | undefined) ?? []),
    );

    // shopId nằm ở custom attribute của idToken
    const shopId = (idPayload['custom:shop_id'] as string | undefined) ?? null;
    const merchantId =
      (idPayload['custom:merchant_id'] as string | undefined) ?? null;

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
      userId: accessPayload.sub,
      username: accessPayload.username,
      groups,
      permissions: uniquePermissions,
      shopId,
      merchantId,
    };
  }
}
