import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RideModule } from '../ride/ride.module';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';

@Module({
  imports: [PrismaModule, RideModule],
  controllers: [DriverController],
  providers: [DriverService],
  exports: [DriverService, RideModule],
})
export class DriverModule {}
