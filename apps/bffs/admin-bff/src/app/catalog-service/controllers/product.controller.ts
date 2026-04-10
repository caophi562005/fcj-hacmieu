import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateProductRequestDto,
  DeleteProductRequestDto,
  GetManyProductsResponseDto,
  UpdateProductRequestDto,
} from '@common/interfaces/dtos/catalog';
import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';

@Controller('catalog/product')
@ApiTags('Catalog/Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // @Get()
  // async getManyProducts(
  //   @Query() queries: GetManyProductsRequestDto,
  //   @ProcessId() processId: string,
  // ) {
  //   const isApproved =
  //     (queries.isApproved as unknown as string) === 'true' ? true : false;
  //   return this.productReadService.getManyProducts({
  //     ...queries,
  //     processId,
  //     brandIds: queries.brandIds ?? [],
  //     categories: queries.categories ?? [],
  //     isApproved,
  //   });
  // }

  // @Get(':id')
  // async getProductById(
  //   @Param() params: GetProductRequestDto,
  //   @ProcessId() processId: string,
  // ) {
  //   return this.productReadService.getProduct({ ...params, processId });
  // }

  @Post()
  @ApiOkResponse({
    type: GetManyProductsResponseDto,
  })
  async createProduct(
    @Body() body: CreateProductRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.productService.createProduct({
      ...body,
      processId,
      createdById: userId,
    });
  }

  @Put()
  @ApiOkResponse({
    type: GetManyProductsResponseDto,
  })
  async updateProduct(
    @Body() body: UpdateProductRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.productService.updateProduct({
      ...body,
      processId,
      updatedById: userId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({
    type: GetManyProductsResponseDto,
  })
  async deleteProduct(
    @Param() params: DeleteProductRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.productService.deleteProduct({
      ...params,
      processId,
      deletedById: userId,
    });
  }
}
