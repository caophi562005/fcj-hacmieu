import { IsPublic } from '@common/decorators/auth.decorator';
import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  ChangePasswordRequestDto,
  ExchangeTokenRequestDto,
  ExchangeTokenResponseDto,
  MessageResponseDto,
} from '@common/interfaces/dtos/iam';
import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';

@Controller('iam/auth')
@ApiTags('Iam/Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('exchange')
  @IsPublic()
  @ApiOkResponse({ type: ExchangeTokenResponseDto })
  login(@Body() body: ExchangeTokenRequestDto, @ProcessId() processId: string) {
    return this.authService.exchangeCode({ ...body, processId });
  }

  @Post('refresh')
  @IsPublic()
  @ApiOkResponse({ type: ExchangeTokenResponseDto })
  refreshSession(
    @ProcessId() processId: string,
    @Headers('x-refresh-token') refreshToken: string,
  ) {
    return this.authService.refreshSession({ refreshToken, processId });
  }

  @Post('logout')
  @ApiOkResponse({ type: MessageResponseDto })
  logout(
    @Headers('x-refresh-token') refreshToken: string,
    @ProcessId() processId: string,
    @Headers('authorization') authorization: string,
  ) {
    const accessToken = authorization.split(' ')[1];
    return this.authService.logout({ refreshToken, accessToken, processId });
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
  @ApiOkResponse({ type: ExchangeTokenResponseDto })
  validateToken(
    @Headers('authorization') authorization: string,
    @ProcessId() processId: string,
  ) {
    const accessToken = authorization.split(' ')[1];
    return this.authService.validateToken({ accessToken, processId });
  }
}
