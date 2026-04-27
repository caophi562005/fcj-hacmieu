import { IsPublic } from '@common/decorators/auth.decorator';
import { ProcessId } from '@common/decorators/process-id.decorator';
import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';

@Controller('iam/auth')
@ApiTags('Iam/Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  // @ApiOkResponse({ type: LoginPostmanResponseDto })
  @IsPublic()
  refreshSession(
    @ProcessId() processId: string,
    @Headers('x-refresh-token') refreshToken: string,
  ) {
    return this.authService.refreshSession({ refreshToken, processId });
  }

  @Post('change-password')
  changePassword(
    @Body()
    body: {
      previousPassword: string;
      proposedPassword: string;
    },
    @Headers('authorization') authorization: string,
    @ProcessId() processId: string,
  ) {
    const accessToken = authorization.split(' ')[1];
    return this.authService.changePassword({ ...body, accessToken, processId });
  }

  @Post('validate')
  validateToken(
    @Headers('authorization') authorization: string,
    @ProcessId() processId: string,
  ) {
    const accessToken = authorization.split(' ')[1];
    return this.authService.validateToken({ accessToken, processId });
  }
}
