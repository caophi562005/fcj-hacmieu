import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  GetManyProductsRequestDto,
  GetManyProductsResponseDto,
  GetProductRequestDto,
  GetProductResponseDto,
} from '@common/interfaces/dtos/catalog';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';

@Controller('catalog/product')
@ApiTags('Catalog/Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOkResponse({ type: GetManyProductsResponseDto })
  async getManyProducts(
    @Query() queries: GetManyProductsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.productService.getManyProducts({ ...queries, processId });
  }

  @Get(':id')
  @ApiOkResponse({ type: GetProductResponseDto })
  async getProduct(
    @Param() params: GetProductRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.productService.getProduct({ ...params, processId });
  }
}
