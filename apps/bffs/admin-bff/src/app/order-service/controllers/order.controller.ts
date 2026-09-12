import { ProcessId } from '@common/decorators/process-id.decorator';
import { UserData } from '@common/decorators/user-data.decorator';
import {
  CancelOrderBodyDto,
  CancelOrderParamsDto,
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
    @UserData('userId') actorId: string,
  ) {
    return this.orderService.updateStatusOrder({
      ...body,
      processId,
      actorType: 'ADMIN',
      actorId,
    });
  }

  @Post(':orderId/cancel')
  async cancelOrder(
    @Param() params: CancelOrderParamsDto,
    @Body() body: CancelOrderBodyDto,
    @ProcessId() processId: string,
    @UserData('userId') actorId: string,
  ) {
    return this.orderService.cancelOrder({
      ...params,
      ...body,
      processId,
      actorType: 'ADMIN',
      actorId,
    });
  }

  @Delete(':orderId')
  async cancelOrderLegacy(
    @Param() params: CancelOrderParamsDto,
    @ProcessId() processId: string,
    @UserData('userId') actorId: string,
  ) {
    return this.orderService.cancelOrder({
      ...params,
      processId,
      actorType: 'ADMIN',
      actorId,
      reasonCode: 'LEGACY_REQUEST',
    });
  }
}
