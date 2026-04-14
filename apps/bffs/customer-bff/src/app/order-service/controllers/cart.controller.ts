import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  AddCartItemRequestDto,
  AddCartItemResponseDto,
  DeleteCartItemRequestDto,
  DeleteCartItemResponseDto,
  GetManyCartItemsRequestDto,
  GetManyCartItemsResponseDto,
  UpdateCartItemRequestDto,
} from '@common/interfaces/dtos/order';
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
import { OrderService } from '../services/order.service';

@Controller('order/cart')
@ApiTags('Order/Cart')
export class CartController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyCartItemsResponseDto,
  })
  async getManyCartItems(
    @Query() queries: GetManyCartItemsRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.orderService.getManyCartItems({
      ...queries,
      processId,
      userId,
    });
  }

  @Post()
  @ApiOkResponse({
    type: AddCartItemResponseDto,
  })
  async addCartItem(
    @Body() body: AddCartItemRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.orderService.addCartItem({
      ...body,
      processId,
      userId,
    });
  }

  @Put()
  @ApiOkResponse({
    type: AddCartItemResponseDto,
  })
  async updateCartItem(
    @Body() body: UpdateCartItemRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.orderService.updateCartItem({
      ...body,
      processId,
      userId,
    });
  }

  @Delete(':cartItemId')
  @ApiOkResponse({
    type: DeleteCartItemResponseDto,
  })
  async deleteCartItem(
    @Param() params: DeleteCartItemRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.orderService.deleteCartItem({
      ...params,
      processId,
      userId,
    });
  }
}
