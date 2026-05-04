import {
  GetDistrictsRequest,
  GetDistrictsResponse,
  GetProvincesRequest,
  GetProvincesResponse,
  GetWardsRequest,
  GetWardsResponse,
  LOCATION_SERVICE_NAME,
  LocationServiceClient,
  UTILITY_SERVICE_PACKAGE_NAME,
} from '@common/interfaces/proto-types/utility';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LocationService implements OnModuleInit {
  private locationModule!: LocationServiceClient;

  constructor(
    @Inject(UTILITY_SERVICE_PACKAGE_NAME)
    private utilityClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.locationModule = this.utilityClient.getService<LocationServiceClient>(
      LOCATION_SERVICE_NAME,
    );
  }

  async getProvinces(data: GetProvincesRequest): Promise<GetProvincesResponse> {
    return firstValueFrom(this.locationModule.getProvinces(data));
  }

  async getDistricts(data: GetDistrictsRequest): Promise<GetDistrictsResponse> {
    return firstValueFrom(this.locationModule.getDistricts(data));
  }

  async getWards(data: GetWardsRequest): Promise<GetWardsResponse> {
    return firstValueFrom(this.locationModule.getWards(data));
  }
}
