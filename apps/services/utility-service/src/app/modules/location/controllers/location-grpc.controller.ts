import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  GetDistrictsRequest,
  GetProvincesRequest,
  GetWardsRequest,
} from '@common/interfaces/models/utility';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LocationService } from '../services/location.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class LocationGrpcController {
  constructor(private readonly locationService: LocationService) {}

  @GrpcMethod(GrpcModuleName.UTILITY.LOCATION, 'GetProvinces')
  getProvinces(data: GetProvincesRequest) {
    return this.locationService.getProvinces(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.LOCATION, 'GetDistricts')
  getDistricts(data: GetDistrictsRequest) {
    return this.locationService.getDistricts(data);
  }

  @GrpcMethod(GrpcModuleName.UTILITY.LOCATION, 'GetWards')
  getWards(data: GetWardsRequest) {
    return this.locationService.getWards(data);
  }
}
