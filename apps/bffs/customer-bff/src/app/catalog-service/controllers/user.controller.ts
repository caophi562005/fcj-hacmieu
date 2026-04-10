import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  UpdateUserRequestDto,
  UserResponseDto,
} from '@common/interfaces/dtos/iam/user.dto';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';

@Controller('iam/user')
@ApiTags('Iam/User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOkResponse({
    type: UserResponseDto,
  })
  async getUser(
    @UserData('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.userService.getUser({ id: userId, processId });
  }

  @Put()
  @ApiOkResponse({
    type: UserResponseDto,
  })
  async updateUser(
    @Body() body: UpdateUserRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.userService.updateUser({
      ...body,
      processId,
      id: userId,
    });
  }
}
