import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  GetBrandRequestDto,
  GetBrandResponseDto,
  GetManyBrandsRequestDto,
  GetManyBrandsResponseDto,
} from '@common/interfaces/dtos/catalog';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { BrandService } from '../services/brand.service';

@Controller('catalog/brand')
@ApiTags('Catalog/Brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOkResponse({ type: GetManyBrandsResponseDto })
  async getManyBrands(
    @Query() queries: GetManyBrandsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.brandService.getManyBrands({ ...queries, processId });
  }

  @Get(':id')
  @ApiOkResponse({ type: GetBrandResponseDto })
  async getBrand(
    @Param() params: GetBrandRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.brandService.getBrand({ ...params, processId });
  }
}
