import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  AddCartItemResponseDto,
  DeleteCartItemResponseDto,
  GetManyCartItemsRequestDto,
  GetManyCartItemsResponseDto,
} from '@common/interfaces/dtos/order';
import {
  AddCartItemRequest,
  DeleteCartItemRequest,
  UpdateCartItemRequest,
} from '@common/interfaces/proto-types/order';
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
import { CartService } from '../services/cart.service';

@Controller('order/cart')
@ApiTags('Order/Cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyCartItemsResponseDto,
  })
  async getManyCartItems(
    @Query() queries: GetManyCartItemsRequestDto,
    @Query('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.cartService.getManyCartItems({
      ...queries,
      userId,
      processId,
    });
  }

  @Post()
  @ApiOkResponse({
    type: AddCartItemResponseDto,
  })
  async addCartItem(
    @Body() body: Omit<AddCartItemRequest, 'processId' | 'userId'>,
    @Body('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.cartService.addCartItem({
      ...body,
      userId,
      processId,
    });
  }

  @Put()
  @ApiOkResponse({
    type: AddCartItemResponseDto,
  })
  async updateCartItem(
    @Body() body: Omit<UpdateCartItemRequest, 'processId' | 'userId'>,
    @Body('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.cartService.updateCartItem({
      ...body,
      userId,
      processId,
    });
  }

  @Delete(':cartItemId')
  @ApiOkResponse({
    type: DeleteCartItemResponseDto,
  })
  async deleteCartItem(
    @Param('cartItemId') cartItemId: string,
    @Query('userId') userId: string,
    @ProcessId() processId: string,
  ) {
    return this.cartService.deleteCartItem({
      cartItemId,
      userId,
      processId,
    } as DeleteCartItemRequest);
  }
}
