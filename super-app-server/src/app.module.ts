import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DriverModule } from './driver/driver.module';
import { WalletModule } from './wallet/wallet.module';
import { RideModule } from './ride/ride.module';
import { FoodModule } from './food/food.module';
import { TravelModule } from './travel/travel.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({
          context: 'HTTP',
        }),
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
                },
              }
            : undefined,
      },
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    DriverModule,
    WalletModule,
    RideModule,
    FoodModule,
    TravelModule,
    ChatModule,
    NotificationModule,
    UploadModule,
    AdminModule,
  ],
})
export class AppModule {}
