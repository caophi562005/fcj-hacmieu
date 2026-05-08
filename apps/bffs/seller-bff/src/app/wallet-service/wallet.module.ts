import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { CreditController } from './controllers/credit.controller';
import { CreditService } from './services/credit.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.WALLET_SERVICE)]),
  ],
  controllers: [CreditController],
  providers: [CreditService],
})
export class WalletModule {}
