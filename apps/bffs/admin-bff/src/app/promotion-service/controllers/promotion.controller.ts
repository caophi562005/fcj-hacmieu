import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CheckPromotionRequestDto,
  CreatePromotionRequestDto,
  DeletePromotionRequestDto,
  GetManyPromotionsRequestDto,
  GetManyPromotionsResponseDto,
  GetPromotionRequestDto,
  GetPromotionResponseDto,
  PromotionResponseDto,
  UpdatePromotionRequestDto,
} from '@common/interfaces/dtos/promotion';
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
import { PromotionService } from '../services/promotion.service';

@Controller('promotion/promotion')
@ApiTags('Promotion/Promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyPromotionsResponseDto,
  })
  async getManyPromotions(
    @Query() queries: GetManyPromotionsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.promotionService.getManyPromotions({
      ...queries,
      processId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    type: GetPromotionResponseDto,
  })
  async getPromotion(
    @Param() params: GetPromotionRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.promotionService.getPromotion({
      ...params,
      processId,
    });
  }

  @Post()
  @ApiOkResponse({
    type: PromotionResponseDto,
  })
  async createPromotion(
    @Body() body: CreatePromotionRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.promotionService.createPromotion({
      ...body,
      processId,
      createdById: userId,
    });
  }

  @Put()
  @ApiOkResponse({
    type: PromotionResponseDto,
  })
  async updatePromotion(
    @Body() body: UpdatePromotionRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.promotionService.updatePromotion({
      ...body,
      processId,
      updatedById: userId,
    });
  }

  @Delete(':id')
  @ApiOkResponse({
    type: PromotionResponseDto,
  })
  async deletePromotion(
    @Param() params: DeletePromotionRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.promotionService.deletePromotion({
      ...params,
      processId,
      deletedById: userId,
    });
  }

  @Post('check')
  @ApiOkResponse({
    type: PromotionResponseDto,
  })
  async checkPromotion(
    @Body() body: CheckPromotionRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.promotionService.checkPromotion({
      ...body,
      processId,
      userId,
    });
  }
}
