import { IsPublic } from '@common/decorators/auth.decorator';
import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  ChangePasswordRequestDto,
  MessageResponseDto,
  RefreshSessionResponseDto,
} from '@common/interfaces/dtos/iam';
import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';

@Controller('iam/auth')
@ApiTags('Iam/Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  @IsPublic()
  @ApiOkResponse({ type: RefreshSessionResponseDto })
  refreshSession(
    @ProcessId() processId: string,
    @Headers('x-refresh-token') refreshToken: string,
  ) {
    return this.authService.refreshSession({ refreshToken, processId });
  }

  @Post('change-password')
  @ApiOkResponse({ type: MessageResponseDto })
  changePassword(
    @Body() body: ChangePasswordRequestDto,
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
