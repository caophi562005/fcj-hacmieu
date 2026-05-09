import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  GetManyUsersRequestDto,
  GetManyUsersResponseDto,
  GetUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
} from '@common/interfaces/dtos/iam';
import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';

@Controller('iam/user')
@ApiTags('Iam/User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyUsersResponseDto,
  })
  async getManyUsers(
    @Query() queries: GetManyUsersRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.userService.getManyUsers({
      ...queries,
      group: queries.group ?? [],
      processId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    type: UserResponseDto,
  })
  async getUser(
    @Param() params: GetUserRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.userService.getUser({
      ...params,
      processId,
    });
  }

  @Put(':id')
  @ApiOkResponse({
    type: UserResponseDto,
  })
  async updateUser(
    @Param() params: GetUserRequestDto,
    @Body() body: UpdateUserRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.userService.updateUser({
      ...body,
      id: params.id,
      processId,
    });
  }
}
