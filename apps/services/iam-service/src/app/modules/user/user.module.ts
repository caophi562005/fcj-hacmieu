import { CacheProvider } from '@common/configurations/redis.config';
import { Global, Module } from '@nestjs/common';
import { UserGrpcController } from './controllers/user-grpc.controller';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';

@Global()
@Module({
  imports: [CacheProvider],
  controllers: [UserGrpcController],
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
