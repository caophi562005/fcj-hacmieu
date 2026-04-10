// import { GrpcClientProvider } from '@common/configurations/grpc.config';
// import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { AuthGrpcController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
// import { ClientsModule } from '@nestjs/microservices';
// import { AuthGrpcController } from './controllers/auth-grpc.controller';
// import { VerificationCodeRepository } from './repositories/verification-code.repository';
// import { AuthService } from './services/auth.service';
// import { EmailService } from './services/email.service';
// import { KeycloakHttpService } from './services/keycloak-htpp.service';
// import { VerificationCodeService } from './services/verification-code.service';

@Module({
  // imports: [
  //   ClientsModule.register([GrpcClientProvider(GrpcService.ROLE_SERVICE)]),
  // ],
  controllers: [AuthGrpcController],
  providers: [AuthService],
})
export class AuthModule {}
