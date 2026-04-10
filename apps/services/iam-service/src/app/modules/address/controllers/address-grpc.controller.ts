import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateAddressRequest,
  DeleteAddressRequest,
  GetAddressRequest,
  GetManyAddressesRequest,
  UpdateAddressRequest,
} from '@common/interfaces/models/iam';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AddressService } from '../services/address.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class AddressGrpcController {
  constructor(private readonly addressService: AddressService) {}

  @GrpcMethod(GrpcModuleName.IAM.ADDRESS, 'GetManyAddresses')
  getManyAddresses(data: GetManyAddressesRequest) {
    return this.addressService.list(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.ADDRESS, 'GetAddress')
  getAddress(data: GetAddressRequest) {
    return this.addressService.findById(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.ADDRESS, 'CreateAddress')
  createAddress(data: CreateAddressRequest) {
    return this.addressService.create(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.ADDRESS, 'UpdateAddress')
  updateAddress(data: UpdateAddressRequest) {
    return this.addressService.update(data);
  }

  @GrpcMethod(GrpcModuleName.IAM.ADDRESS, 'DeleteAddress')
  deleteAddress(data: DeleteAddressRequest) {
    return this.addressService.delete(data);
  }
}
