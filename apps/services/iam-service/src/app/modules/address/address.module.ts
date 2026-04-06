import { Global, Module } from '@nestjs/common';
import { AddressGrpcController } from './controllers/address-grpc.controller';
import { AddressRepository } from './repositories/address.repository';
import { AddressService } from './services/address.service';

@Global()
@Module({
  controllers: [AddressGrpcController],
  providers: [AddressRepository, AddressService],
})
export class AddressModule {}
