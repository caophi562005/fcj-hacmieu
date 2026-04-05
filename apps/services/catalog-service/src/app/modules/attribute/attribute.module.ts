import { Global, Module } from '@nestjs/common';
import { AttributeGrpcController } from './controllers/attribute-grpc.controller';
import { AttributeRepository } from './repositories/attribute.repository';
import { AttributeService } from './services/attribute.service';

@Global()
@Module({
  controllers: [AttributeGrpcController],
  providers: [AttributeRepository, AttributeService],
  exports: [AttributeService],
})
export class AttributeModule {}
