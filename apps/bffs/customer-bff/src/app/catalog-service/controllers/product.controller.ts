import { IsPublic } from '@common/decorators/auth.decorator';
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

function normalizeStringArrayQuery(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const normalized = value
      .flatMap((item) =>
        typeof item === 'string' ? item.split(',') : [String(item)],
      )
      .map((item) => item.trim())
      .filter(Boolean);
    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof value === 'string') {
    const normalized = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return normalized.length > 0 ? normalized : undefined;
  }

  return undefined;
}

@Controller('catalog/product')
@ApiTags('Catalog/Product')
@IsPublic()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOkResponse({ type: GetManyProductsResponseDto })
  async getManyProducts(
    @Query() queries: GetManyProductsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.productService.getManyProducts({
      ...queries,
      categories: normalizeStringArrayQuery(queries.categories),
      processId,
    });
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
