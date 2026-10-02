import { Module } from '@nestjs/common';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';
import { RideGateway } from './ride.gateway';

@Module({
  controllers: [RideController],
  providers: [RideService, RideGateway],
  exports: [RideService, RideGateway],
})
export class RideModule {}
