import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  GetCategoryRequestDto,
  GetCategoryResponseDto,
  GetManyCategoriesRequestDto,
  GetManyCategoriesResponseDto,
} from '@common/interfaces/dtos/catalog';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';

@Controller('catalog/category')
@ApiTags('Catalog/Category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ type: GetManyCategoriesResponseDto })
  async getManyCategories(
    @Query() queries: GetManyCategoriesRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.categoryService.getManyCategories({
      page: 1,
      limit: 10,
      ...queries,
      processId,
    });
  }

  @Get(':id')
  @ApiOkResponse({ type: GetCategoryResponseDto })
  async getCategory(
    @Param() params: GetCategoryRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.categoryService.getCategory({ ...params, processId });
  }
}
