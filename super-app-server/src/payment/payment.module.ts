import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CronService } from './cron.service';
import { PrismaModule } from '../prisma/prisma.module';
import { VietQrWebhookProvider } from './providers/vietqr-webhook.provider';
import { PayoutModule } from '../payout/payout.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    PayoutModule,
    NotificationModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, CronService, VietQrWebhookProvider],
  exports: [PaymentService, CronService],
})
export class PaymentModule {}
