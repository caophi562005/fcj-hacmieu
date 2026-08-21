import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateProductPlacementRequestDto,
  GetProductPlacementsRequestDto,
  GetProductPlacementsResponseDto,
  ProductPlacementConfigResponseDto,
  ProductPlacementResponseDto,
} from '@common/interfaces/dtos/wallet';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ProductPlacementService } from '../services/product-placement.service';

@Controller('marketing/placements')
@ApiTags('Marketing/Product placements')
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
    @UserData('shopId') shopId: string,
  ) {
    if (!shopId) throw new BadRequestException('Shop ID is required');
    return this.service.list({ ...query, shopId, processId });
  }

  @Post()
  @ApiOkResponse({ type: ProductPlacementResponseDto })
  create(
    @Body() body: CreateProductPlacementRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    if (!shopId) throw new BadRequestException('Shop ID is required');
    return this.service.create({ ...body, shopId, processId });
  }
}
