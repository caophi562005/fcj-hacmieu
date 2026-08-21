import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CancelProductPlacementRequestDto,
  GetProductPlacementsRequestDto,
  GetProductPlacementsResponseDto,
  ProductPlacementConfigResponseDto,
  ProductPlacementResponseDto,
  ProductPlacementIdParamDto,
} from '@common/interfaces/dtos/wallet';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ProductPlacementService } from '../services/product-placement.service';

@Controller('admin/placements')
@ApiTags('Admin/Product placements')
@UsePipes(ZodValidationPipe)
export class ProductPlacementController {
  constructor(private readonly service: ProductPlacementService) {}
  @Get('config')
  @ApiOkResponse({ type: ProductPlacementConfigResponseDto })
  getConfig(@ProcessId() processId: string) {
    return this.service.getConfig({ processId });
  }
  @Get()
  @ApiOkResponse({ type: GetProductPlacementsResponseDto })
  list(
    @Query() query: GetProductPlacementsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.service.list({ ...query, processId });
  }
  @Patch(':placementId/cancel')
  @ApiOkResponse({ type: ProductPlacementResponseDto })
  cancel(
    @Param() params: ProductPlacementIdParamDto,
    @Body() body: CancelProductPlacementRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') actorId: string,
  ) {
    return this.service.cancel({ ...body, ...params, actorId, processId });
  }
}
