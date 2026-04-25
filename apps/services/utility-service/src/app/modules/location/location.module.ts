import { Module } from '@nestjs/common';
import { LocationGrpcController } from './controllers/location-grpc.controller';
import { LocationService } from './services/location.service';

@Module({
  controllers: [LocationGrpcController],
  providers: [LocationService],
})
export class LocationModule {}
