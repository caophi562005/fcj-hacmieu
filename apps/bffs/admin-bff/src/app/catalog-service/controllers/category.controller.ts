import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CreateCategoryRequestDto,
  DeleteCategoryRequestDto,
  GetCategoryResponseDto,
  UpdateCategoryRequestDto,
} from '@common/interfaces/dtos/catalog';
import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';

@Controller('catalog/category')
@ApiTags('Catalog/Category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // @Get()
  // async getManyCategories(
  //   @Query() queries: GetManyCategoriesRequestDto,
  //   @ProcessId() processId: string
  // ) {
  //   return this.categoryReadService.getManyCategories({
  //     ...queries,
  //     processId,
  //   });
  // }

  // @Get(':id')
  // async getCategoryById(
  //   @Param() params: GetCategoryRequestDto,
  //   @ProcessId() processId: string
  // ) {
  //   return this.categoryReadService.getCategory({ ...params, processId });
  // }

  @Post()
  @ApiOkResponse({
    type: GetCategoryResponseDto,
  })
  async createCategory(
    @Body() body: CreateCategoryRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.categoryService.createCategory({
      ...body,
      processId,
      createdById: userId,
    });
  }

  @Put()
  @ApiOkResponse({
    type: GetCategoryResponseDto,
  })
  async updateCategory(
    @Body() body: UpdateCategoryRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.categoryService.updateCategory({
      ...body,
      processId,
      updatedById: userId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({
    type: GetCategoryResponseDto,
  })
  async deleteCategory(
    @Param() params: DeleteCategoryRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.categoryService.deleteCategory({
      ...params,
      processId,
      deletedById: userId,
    });
  }
}
