import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateBrandRequestDto,
  DeleteBrandRequestDto,
  UpdateBrandRequestDto,
} from '@common/interfaces/dtos/catalog';
import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BrandService } from '../services/brand.service';

@Controller('catalog/brand')
@ApiTags('Catalog/Brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  // @Get()
  // async getManyBrands(
  //   @Query() queries: GetManyBrandsRequestDto,
  //   @ProcessId() processId: string,
  // ) {
  //   return this.brandReadService.getManyBrands({ ...queries, processId });
  // }

  // @Get(':id')
  // async getBrandById(
  //   @Param() params: GetBrandRequestDto,
  //   @ProcessId() processId: string,
  // ) {
  //   return this.brandReadService.getBrand({ ...params, processId });
  // }

  @Post()
  async createBrand(
    @Body() body: CreateBrandRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.brandService.createBrand({
      ...body,
      processId,
      createdById: userId,
    });
  }

  @Put()
  async updateBrand(
    @Body() body: UpdateBrandRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.brandService.updateBrand({
      ...body,
      processId,
      updatedById: userId,
    });
  }

  @Delete(':id')
  async deleteBrand(
    @Param() params: DeleteBrandRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.brandService.deleteBrand({
      ...params,
      processId,
      deletedById: userId,
    });
  }
}
