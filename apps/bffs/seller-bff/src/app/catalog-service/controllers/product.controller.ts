import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateProductRequestDto,
  DeleteProductRequestDto,
  GetManyProductsRequestDto,
  GetManyProductsResponseDto,
  GetProductRequestDto,
  GetProductResponseDto,
  UpdateProductRequestDto,
} from '@common/interfaces/dtos/catalog/product.dto';
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
    @UserData('shopId') shopId: string,
  ) {
    return this.productService.getManyProducts({
      ...queries,
      categories: queries.categories ?? [],
      processId,
      shopId,
    });
  }

  @Get(':id')
  @ApiOkResponse({ type: GetProductResponseDto })
  async getProduct(
    @Param() params: GetProductRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    return this.productService.getProduct({
      ...params,
      processId,
      shopId,
    });
  }

  @Post()
  @ApiOkResponse({ type: GetProductResponseDto })
  async createProduct(
    @Body() body: CreateProductRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
    @UserData('userId') userId: string,
  ) {
    return this.productService.createProduct({
      ...body,
      processId,
      shopId,
      createdById: userId,
    });
  }

  @Put(':id')
  @ApiOkResponse({ type: GetProductResponseDto })
  async updateProduct(
    @Param('id') id: string,
    @Body() body: UpdateProductRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
    @UserData('userId') userId: string,
  ) {
    return this.productService.updateProduct({
      ...body,
      id,
      processId,
      shopId,
      updatedById: userId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({ type: GetProductResponseDto })
  async deleteProduct(
    @Param() params: DeleteProductRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
    @UserData('userId') userId: string,
  ) {
    return this.productService.deleteProduct({
      ...params,
      processId,
      shopId,
      deletedById: userId,
    });
  }
}
