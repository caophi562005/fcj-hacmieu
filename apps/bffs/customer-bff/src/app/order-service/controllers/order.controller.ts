import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CancelOrderRequestDto,
  CreateOrderRequestDto,
  CreateOrderResponseDto,
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
  Post,
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
    @UserData('userId') userId: string,
  ) {
    return this.orderService.getManyOrders({
      ...queries,
      processId,
      userId,
    });
  }

  @Get(':orderId')
  @ApiOkResponse({
    type: GetOrderResponseDto,
  })
  async getOrder(
    @Param() params: GetOrderRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.orderService.getOrder({
      ...params,
      processId,
      userId,
    });
  }

  @Post()
  @ApiOkResponse({
    type: CreateOrderResponseDto,
  })
  async createOrder(
    @Body() body: CreateOrderRequestDto,
    @ProcessId() processId: string,
    @UserData('userId') userId: string,
  ) {
    return this.orderService.createOrder({
      ...body,
      processId,
      userId,
    });
  }

  // @Post('test-message')
  // async testSendOrderMessage(@Body() body: Record<string, unknown>) {
  //   return this.orderService.sendOrderMessage(body);
  // }

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
    @UserData('userId') userId: string,
  ) {
    return this.orderService.cancelOrder({
      ...params,
      processId,
      userId,
    });
  }
}
