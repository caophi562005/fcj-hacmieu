import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  CancelOrderRequestDto,
  GetManyOrdersRequestDto,
  GetManyOrdersResponseDto,
  GetOrderRequestDto,
  GetOrderResponseDto,
  UpdateOrderStatusRequestDto,
} from '@common/interfaces/dtos/order';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
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
  ) {
    return this.orderService.getManyOrders({
      ...queries,
      processId,
    });
  }

  @Get(':orderId')
  @ApiOkResponse({
    type: GetOrderResponseDto,
  })
  async getOrder(
    @Param() params: GetOrderRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.orderService.getOrder({
      ...params,
      processId,
    });
  }

  @Put('status')
  async updateStatusOrder(
    @Body() body: UpdateOrderStatusRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.orderService.updateStatusOrder({
      ...body,
      processId,
    });
  }

  @Delete(':orderId')
  async cancelOrder(
    @Param() params: CancelOrderRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.orderService.cancelOrder({
      ...params,
      processId,
    });
  }
}
