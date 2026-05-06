import { IsPublic } from '@common/decorators/auth.decorator';
import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  ChangePasswordRequestDto,
  MessageResponseDto,
  RefreshSessionResponseDto,
} from '@common/interfaces/dtos/iam';
import { getAccessToken } from '@common/utils/get-access.util';
import { GroupValues } from '@common/constants/user.constant';
import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
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
    return this.authService.refreshSession({
      refreshToken,
      processId,
      type: GroupValues.SELLER,
    });
  }

  @Post('change-password')
  @ApiOkResponse({ type: MessageResponseDto })
  changePassword(
    @Body() body: ChangePasswordRequestDto,
    @Req() req: any,
    @ProcessId() processId: string,
  ) {
    const accessToken = getAccessToken(req);
    return this.authService.changePassword({ ...body, accessToken, processId });
  }

  @Post('logout')
  @ApiOkResponse({ type: MessageResponseDto })
  logout(@Req() req: any, @ProcessId() processId: string) {
    const accessToken = getAccessToken(req);
    return this.authService.logout({ accessToken, processId });
  }
}
