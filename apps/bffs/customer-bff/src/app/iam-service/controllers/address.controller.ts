import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateAddressRequestDto,
  DeleteAddressRequestDto,
  GetAddressRequestDto,
  GetAddressResponseDto,
  GetManyAddressesRequestDto,
  GetManyAddressesResponseDto,
  UpdateAddressRequestDto,
} from '@common/interfaces/dtos/iam/address.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AddressService } from '../services/addesss.service';

@Controller('iam/address')
@ApiTags('Iam/Address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyAddressesResponseDto,
  })
  async getManyAddresses(
    @Query() queries: GetManyAddressesRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.addressService.getManyAddresses({
      ...queries,
      processId,
      userId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    type: GetAddressResponseDto,
  })
  async getAddress(
    @Param() params: GetAddressRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.addressService.getAddress({
      ...params,
      processId,
      userId,
    });
  }

  @Post()
  @ApiOkResponse({
    type: GetAddressResponseDto,
  })
  async createAddress(
    @Body() body: CreateAddressRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.addressService.createAddress({
      ...body,
      processId,
      userId,
    });
  }

  @Put()
  @ApiOkResponse({
    type: GetAddressResponseDto,
  })
  async updateAddress(
    @Body() body: UpdateAddressRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.addressService.updateAddress({
      ...body,
      processId,
      userId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({
    type: GetAddressResponseDto,
  })
  async deleteAddress(
    @Param() params: DeleteAddressRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.addressService.deleteAddress({
      ...params,
      processId,
      userId,
    });
  }
}
