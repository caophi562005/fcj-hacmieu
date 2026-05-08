import { Global, Module } from '@nestjs/common';
import { CreditGrpcController } from './controllers/credit-grpc.controller';
import { CreditRepository } from './repositories/credit.repository';
import { CreditService } from './services/credit.service';

@Global()
@Module({
  controllers: [CreditGrpcController],
  providers: [CreditRepository, CreditService],
  exports: [CreditService],
})
export class CreditModule {}
