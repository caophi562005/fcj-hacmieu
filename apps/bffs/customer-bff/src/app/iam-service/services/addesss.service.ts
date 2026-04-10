import {
  ADDRESS_MODULE_SERVICE_NAME,
  AddressModuleClient,
  AddressResponse,
  CreateAddressRequest,
  DeleteAddressRequest,
  GetAddressRequest,
  GetManyAddressesRequest,
  GetManyAddressesResponse,
  IAM_SERVICE_PACKAGE_NAME,
  UpdateAddressRequest,
} from '@common/interfaces/proto-types/iam';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AddressService implements OnModuleInit {
  private addressModule!: AddressModuleClient;

  constructor(
    @Inject(IAM_SERVICE_PACKAGE_NAME)
    private iamClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.addressModule = this.iamClient.getService<AddressModuleClient>(
      ADDRESS_MODULE_SERVICE_NAME,
    );
  }

  async getManyAddresses(
    data: GetManyAddressesRequest,
  ): Promise<GetManyAddressesResponse> {
    return firstValueFrom(this.addressModule.getManyAddresses(data));
  }

  async getAddress(data: GetAddressRequest): Promise<AddressResponse> {
    return firstValueFrom(this.addressModule.getAddress(data));
  }

  async createAddress(data: CreateAddressRequest): Promise<AddressResponse> {
    return firstValueFrom(this.addressModule.createAddress(data));
  }

  async updateAddress(data: UpdateAddressRequest): Promise<AddressResponse> {
    return firstValueFrom(this.addressModule.updateAddress(data));
  }

  async deleteAddress(data: DeleteAddressRequest): Promise<AddressResponse> {
    return firstValueFrom(this.addressModule.deleteAddress(data));
  }
}
