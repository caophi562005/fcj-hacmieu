import { GrpcService } from '@common/constants/grpc.constant';
import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { MerchantGrpcController } from './controllers/merchant-grpc.controller';
import { MerchantRepository } from './repositories/merchant.repository';
import { MerchantService } from './services/merchant.service';

@Global()
@Module({
  imports: [ClientsModule.register([GrpcClientProvider(GrpcService.IAM_SERVICE)])],
  controllers: [MerchantGrpcController],
  providers: [MerchantRepository, MerchantService],
  exports: [MerchantRepository],
})
export class MerchantModule {}
