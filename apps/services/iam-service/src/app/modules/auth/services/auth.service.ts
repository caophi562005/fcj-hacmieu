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
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { PermissionService } from '../../permission/services/permission.service';

const client = new CognitoIdentityProviderClient({
  region: BaseConfiguration.AWS_REGION,
});

@Injectable()
export class AuthService {
  constructor(private readonly permissionService: PermissionService) {}

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
    const verifier = CognitoJwtVerifier.create({
      userPoolId: AuthConfiguration.USER_POOL_ID,
      tokenUse: 'access',
      clientId: AuthConfiguration.CLIENT_ID,
    });

    const payload = await verifier.verify(data.accessToken);

    if (!payload) {
      return {
        isValid: false,
        userId: payload.sub,
        username: payload.username,
      };
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return {
        isValid: false,
        userId: payload.sub,
        username: payload.username,
      };
    }

    let permissions: GetAllPermissionsResponse;
    if (payload['cognito:groups']) {
      permissions = await this.permissionService.listAll({
        group: payload['cognito:groups'][0] as GroupType,
      });
    }

    return {
      isValid: true,
      userId: payload.sub,
      username: payload.username,
      groups: payload['cognito:groups'][0] || 'Unknown',
      permissions: permissions ? permissions.permissions : [],
    };
  }
}
