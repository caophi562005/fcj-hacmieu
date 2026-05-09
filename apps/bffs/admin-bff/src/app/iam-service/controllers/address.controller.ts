import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  CreateAddressRequestDto,
  GetAddressResponseDto,
  GetManyAddressesRequestDto,
  GetManyAddressesResponseDto,
  UpdateAddressRequestDto,
} from '@common/interfaces/dtos/iam';
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
import { AddressService } from '../services/address.service';

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
    @Query('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.addressService.getManyAddresses({
      ...queries,
      userId,
      processId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    type: GetAddressResponseDto,
  })
  async getAddress(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.addressService.getAddress({
      id,
      userId,
      processId,
    });
  }

  @Post()
  @ApiOkResponse({
    type: GetAddressResponseDto,
  })
  async createAddress(
    @Body() body: CreateAddressRequestDto,
    @Body('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.addressService.createAddress({
      ...body,
      userId,
      processId,
    });
  }

  @Put(':id')
  @ApiOkResponse({
    type: GetAddressResponseDto,
  })
  async updateAddress(
    @Param('id') id: string,
    @Body() body: UpdateAddressRequestDto,
    @Body('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.addressService.updateAddress({
      ...body,
      id,
      userId,
      processId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({
    type: GetAddressResponseDto,
  })
  async deleteAddress(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.addressService.deleteAddress({
      id,
      userId,
      processId,
    });
  }
}
