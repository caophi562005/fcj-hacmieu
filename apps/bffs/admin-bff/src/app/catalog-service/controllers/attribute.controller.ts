import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateAttributeRequestDto,
  DeleteAttributeRequestDto,
  GetAttributeResponseDto,
  UpdateAttributeRequestDto,
} from '@common/interfaces/dtos/catalog';
import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AttributeService } from '../services/attribute.service';

@Controller('attribute')
@ApiTags('Product')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  // @Get()
  // async getManyAttributes(
  //   @Query() queries: GetManyAttributesRequestDto,
  //   @ProcessId() processId: string
  // ) {
  //   return this.attributeReadService.getManyAttributes({
  //     ...queries,
  //     processId,
  //   });
  // }

  // @Get(':id')
  // async getAttributeById(
  //   @Param() params: GetAttributeRequestDto,
  //   @ProcessId() processId: string
  // ) {
  //   return this.attributeReadService.getAttribute({ ...params, processId });
  // }

  @Post()
  @ApiOkResponse({
    type: GetAttributeResponseDto,
  })
  async createAttribute(
    @Body() body: CreateAttributeRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.attributeService.createAttribute({
      ...body,
      processId,
      createdById: userId,
    });
  }

  @Put()
  @ApiOkResponse({
    type: GetAttributeResponseDto,
  })
  async updateAttribute(
    @Body() body: UpdateAttributeRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.attributeService.updateAttribute({
      ...body,
      processId,
      updatedById: userId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({
    type: GetAttributeResponseDto,
  })
  async deleteAttribute(
    @Param() params: DeleteAttributeRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.attributeService.deleteAttribute({
      ...params,
      processId,
      deletedById: userId,
    });
  }
}
