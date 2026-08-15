import {
  GetPlatformLedgerListQueryDto,
  GetPlatformLedgerListQuerySchema,
  GetPlatformRevenueSummaryQueryDto,
  GetPlatformRevenueSummaryQuerySchema,
} from '@common/schemas/wallet';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ZodSerializerDto } from 'nestjs-zod';
import { PlatformLedgerService } from '../services/platform-ledger.service';

@Controller('admin/revenue')
export class PlatformLedgerController {
  constructor(private readonly platformLedgerService: PlatformLedgerService) {}

  @Get('summary')
  @ZodSerializerDto(GetPlatformRevenueSummaryQuerySchema)
  async getSummary(@Query() query: GetPlatformRevenueSummaryQueryDto) {
    return this.platformLedgerService.getPlatformRevenueSummary(query);
  }

  @Get('ledger')
  @ZodSerializerDto(GetPlatformLedgerListQuerySchema)
  async getLedgerList(@Query() query: GetPlatformLedgerListQueryDto) {
    return this.platformLedgerService.getPlatformLedgerList(query);
  }

  @Get('export-excel')
  async exportExcel(
    @Query() query: GetPlatformLedgerListQueryDto,
    @Res() res: Response,
  ) {
    const listRes = await this.platformLedgerService.getPlatformLedgerList({
      ...query,
      page: 1,
      limit: 10000,
    });

    const headers = [
      'STT',
      'Mã Đơn Hàng (OrderId)',
      'Mã Shop (ShopId)',
      'Doanh Thu Gộp (VND)',
      'Tỷ Lệ Hoa Hồng (%)',
      'Phí Hoa Hồng Sàn (VND)',
      'Tỷ Lệ Thuế (%)',
      'Thuế Nộp Thay (VND)',
      'Thực Nhận Seller (VND)',
      'Thời Gian Ghi Nhận',
    ];

    const rows = (listRes.items || []).map((item, idx) => [
      idx + 1,
      `"${item.orderId}"`,
      `"${item.shopId}"`,
      item.grossAmount,
      item.commissionRate,
      item.commissionFee,
      item.taxRate,
      item.taxWithheld,
      item.netSellerAmount,
      `"${new Date(item.createdAt).toLocaleString('vi-VN')}"`,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const filename = `Bao_Cao_Doanh_Thu_V-Shop_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.send(csvContent);
  }
}
