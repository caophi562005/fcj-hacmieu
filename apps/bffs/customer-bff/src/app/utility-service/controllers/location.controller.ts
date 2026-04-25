import { IsPublic } from '@common/decorators/auth.decorator';
import { ProcessId } from '@common/decorators/process-id.decorator';
import {
  GetDistrictsRequestDto,
  GetDistrictsResponseDto,
  GetProvincesResponseDto,
  GetWardsRequestDto,
  GetWardsResponseDto,
} from '@common/interfaces/dtos/utility';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LocationService } from '../services/location.service';

@Controller('utility/location')
@ApiTags('Utility/Location')
@IsPublic()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('provinces')
  @ApiOkResponse({ type: GetProvincesResponseDto })
  getProvinces(@ProcessId() processId: string) {
    return this.locationService.getProvinces({ processId });
  }

  @Get('districts')
  @ApiOkResponse({ type: GetDistrictsResponseDto })
  getDistricts(
    @Query() queries: GetDistrictsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.locationService.getDistricts({ ...queries, processId });
  }

  @Get('wards')
  @ApiOkResponse({ type: GetWardsResponseDto })
  getWards(
    @Query() queries: GetWardsRequestDto,
    @ProcessId() processId: string,
  ) {
    return this.locationService.getWards({ ...queries, processId });
  }
}
