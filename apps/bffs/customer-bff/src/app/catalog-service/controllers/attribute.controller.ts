import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  GetAttributeRequestDto,
  GetAttributeResponseDto,
  GetManyAttributesRequestDto,
  GetManyAttributesResponseDto,
} from '@common/interfaces/dtos/catalog';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AttributeService } from '../services/attribute.service';

@Controller('catalog/attribute')
@ApiTags('Catalog/Attribute')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Get()
  @ApiOkResponse({ type: GetManyAttributesResponseDto })
  async getManyAttributes(
    @Query() queries: GetManyAttributesRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.attributeService.getManyAttributes({ ...queries, processId });
  }

  @Get(':id')
  @ApiOkResponse({ type: GetAttributeResponseDto })
  async getAttribute(
    @Param() params: GetAttributeRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.attributeService.getAttribute({ ...params, processId });
  }
}
