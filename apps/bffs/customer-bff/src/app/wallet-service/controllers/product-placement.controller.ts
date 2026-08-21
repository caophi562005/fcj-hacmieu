import { IsPublic } from '@common/decorators/auth.decorator';
import { ProcessId } from '@common/decorators/process-id.decorator';
import { GetProductPlacementsResponseDto } from '@common/interfaces/dtos/wallet';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProductPlacementService } from '../services/product-placement.service';

@IsPublic()
@Controller('marketing/placements')
@ApiTags('Marketing/Product placements')
export class ProductPlacementController {
  constructor(private readonly service: ProductPlacementService) {}
  @Get('home')
  @ApiOkResponse({ type: GetProductPlacementsResponseDto })
  listHome(@ProcessId() processId: string) {
    return this.service.listActive({ processId });
  }
}
