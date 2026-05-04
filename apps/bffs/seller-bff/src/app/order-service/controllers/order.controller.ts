import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  GetManyOrdersRequestDto,
  GetManyOrdersResponseDto,
  GetOrderRequestDto,
  GetOrderResponseDto,
  UpdateOrderStatusRequestDto,
} from '@common/interfaces/dtos/order/order.dto';
import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';

@Controller('order/order')
@ApiTags('Order/Order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOkResponse({
    type: GetManyOrdersResponseDto,
  })
  async getManyOrders(
    @Query() queries: GetManyOrdersRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    return this.orderService.getManyOrders({
      ...queries,
      processId,
      shopId,
    });
  }

  @Get(':orderId')
  @ApiOkResponse({
    type: GetOrderResponseDto,
  })
  async getOrder(
    @Param() params: GetOrderRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    return this.orderService.getOrder({
      ...params,
      shopId,
      processId,
    });
  }

  @Put('status')
  async updateStatusOrder(
    @Body() body: UpdateOrderStatusRequestDto,
    @ProcessId() processId: string,
    @UserData('shopId') shopId: string,
  ) {
    return this.orderService.updateStatusOrder({
      ...body,
      shopId,
      processId,
    });
  }
}
