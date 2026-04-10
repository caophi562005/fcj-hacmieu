import { Global, Module } from '@nestjs/common';
import { MerchantGrpcController } from './controllers/merchant-grpc.controller';
import { MerchantRepository } from './repositories/merchant.repository';
import { MerchantService } from './services/merchant.service';

@Global()
@Module({
  controllers: [MerchantGrpcController],
  providers: [MerchantRepository, MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}
