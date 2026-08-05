import { Module } from '@nestjs/common';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MockPayoutProvider } from './providers/mock-payout.provider';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [PayoutController],
  providers: [PayoutService, MockPayoutProvider],
  exports: [PayoutService],
})
export class PayoutModule {}
