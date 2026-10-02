import { Module } from '@nestjs/common';
import { RideModule } from '../ride/ride.module';

@Module({
  imports: [RideModule],
  exports: [RideModule],
})
export class DriverModule {}
