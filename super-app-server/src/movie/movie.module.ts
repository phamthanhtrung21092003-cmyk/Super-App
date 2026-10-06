import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { CinemaIntegrationModule } from './integration/cinema-integration.module';
import { SeatHoldService } from './seat-hold.service';
import { MovieOrderService } from './movie-order.service';
import { MovieBookingService } from './movie-booking.service';
import { MovieController } from './movie.controller';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    NotificationModule,
    CinemaIntegrationModule,
  ],
  controllers: [MovieController],
  providers: [
    SeatHoldService,
    MovieOrderService,
    MovieBookingService,
  ],
  exports: [
    SeatHoldService,
    MovieOrderService,
    MovieBookingService,
    CinemaIntegrationModule,
  ],
})
export class MovieModule {}