import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { UploadModule } from '../upload/upload.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [UploadModule, NotificationModule],
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}

