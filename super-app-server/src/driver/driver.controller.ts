import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Unified Driver API (Ride + Delivery + Food)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER)
@Controller({ path: 'driver', version: ['1', VERSION_NEUTRAL] })
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get('active-job')
  @ApiOperation({ summary: 'Lấy công việc đang thực hiện của tài xế (Ride, Delivery hoặc Food)' })
  async getActiveJob(@CurrentUser() user: { id: string }) {
    const job = await this.driverService.getActiveJob(user.id);
    const activeJobObj = job.hasActiveJob
      ? {
          ...job,
          id: job.jobId,
          type: job.jobType,
        }
      : null;
    return {
      ...job,
      id: job.jobId,
      type: job.jobType,
      activeJob: activeJobObj,
    };
  }

  @Get('available-jobs')
  @ApiOperation({ summary: 'Quét toàn bộ công việc khả dụng xung quanh (Ride + Delivery + Food)' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  async getAvailableJobs(
    @CurrentUser() user: { id: string },
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
  ) {
    const jobs = await this.driverService.getAvailableJobs(
      user.id,
      lat ? Number(lat) : undefined,
      lng ? Number(lng) : undefined,
    );
    return {
      jobs,
      rideTrips: jobs.filter(j => j.jobType === 'RIDE' || j.jobType === 'DELIVERY'),
      foodOrders: jobs.filter(j => j.jobType === 'FOOD'),
      total: jobs.length,
    };
  }

  @Post('toggle-online')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bật/tắt trực tuyến hợp nhất 1 chạm cho cả 3 dịch vụ' })
  async toggleOnline(
    @CurrentUser() user: { id: string },
    @Body() body: { isOnline: boolean },
  ) {
    return this.driverService.toggleOnline(user.id, Boolean(body?.isOnline));
  }

  @Post('location')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật tọa độ GPS định kỳ 1 lần cho tài xế' })
  async updateLocation(
    @CurrentUser() user: { id: string },
    @Body() body: { lat: number; lng: number; heading?: number; speed?: number },
  ) {
    return this.driverService.updateLocation(
      user.id,
      body.lat,
      body.lng,
      body.heading,
      body.speed,
    );
  }

  @Get('settings')
  @ApiOperation({ summary: 'Lấy cấu hình nhận việc của tài xế (Ride, Delivery, Food)' })
  async getSettings(@CurrentUser() user: { id: string }) {
    return this.driverService.getDriverSettings(user.id);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Cập nhật cấu hình nhận việc của tài xế (PATCH)' })
  async updateSettingsPatch(
    @CurrentUser() user: { id: string },
    @Body()
    body: {
      enableRide?: boolean;
      enableDelivery?: boolean;
      enableFood?: boolean;
      dispatchRadius?: number;
      autoAccept?: boolean;
    },
  ) {
    return this.driverService.updateDriverSettings(user.id, body);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Cập nhật cấu hình nhận việc của tài xế (PUT)' })
  async updateSettingsPut(
    @CurrentUser() user: { id: string },
    @Body()
    body: {
      enableRide?: boolean;
      enableDelivery?: boolean;
      enableFood?: boolean;
      dispatchRadius?: number;
      autoAccept?: boolean;
    },
  ) {
    return this.driverService.updateDriverSettings(user.id, body);
  }
}
