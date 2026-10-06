import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CinemaBrand } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SeatHoldService } from './seat-hold.service';
import { MovieOrderService } from './movie-order.service';
import { MovieBookingService } from './movie-booking.service';
import {
  CreateMovieOrderDto,
  HoldSeatsDto,
  ReleaseSeatsDto,
  ValidateMovieVoucherDto,
} from './dto/movie-phase3.dto';

@ApiTags('Movie Ticket Service (V-Life Phase 3)')
@Controller('movies')
export class MovieController {
  constructor(
    private readonly seatHoldService: SeatHoldService,
    private readonly movieOrderService: MovieOrderService,
    private readonly movieBookingService: MovieBookingService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách phim đang chiếu & sắp chiếu' })
  async getMovies() {
    return this.movieOrderService.getMovies();
  }

  @Get('cinemas')
  @ApiOperation({ summary: 'Danh sách cụm rạp chiếu phim' })
  async getCinemas(
    @Query('brand') brand?: CinemaBrand,
    @Query('city') city?: string,
  ) {
    return this.movieOrderService.getCinemas(brand, city);
  }

  @Get('showtimes')
  @ApiOperation({ summary: 'Danh sách suất chiếu theo phim / rạp / ngày' })
  async getShowtimes(
    @Query('movieId') movieId?: string,
    @Query('cinemaId') cinemaId?: string,
    @Query('date') date?: string,
  ) {
    return this.movieOrderService.getShowtimes({ movieId, cinemaId, date });
  }

  @Get('showtimes/:showtimeId/seats')
  @ApiOperation({ summary: 'Sơ đồ ghế và trạng thái ghế theo suất chiếu' })
  async getShowtimeSeats(@Param('showtimeId') showtimeId: string) {
    return this.movieOrderService.getShowtimeSeats(showtimeId);
  }

  @Get('vouchers')
  @ApiOperation({ summary: 'Danh sách mã giảm giá đặt vé xem phim đang hoạt động' })
  async getVouchers(@Query('cinemaId') cinemaId?: string) {
    return this.movieOrderService.getVouchers(cinemaId);
  }

  @Post('vouchers/validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kiểm tra và tính thử mức giảm giá Voucher trên Server' })
  async validateVoucher(@Req() req: any, @Body() dto: ValidateMovieVoucherDto) {
    const userId = req.user.sub || req.user.id;
    return this.movieOrderService.validateVoucher(userId, dto);
  }

  @Get('combos')
  @ApiOperation({ summary: 'Danh sách Combo bắp nước theo rạp' })
  async getCombos(@Query('cinemaId') cinemaId?: string) {
    return this.movieOrderService.getCombos(cinemaId);
  }

  @Post('seat-holds')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Giữ ghế (Seat Hold) có bảo vệ Concurrency & TTL' })
  async holdSeats(@Req() req: any, @Body() dto: HoldSeatsDto) {
    const userId = req.user.sub || req.user.id;
    return this.seatHoldService.holdSeats(userId, dto);
  }

  @Post('seat-holds/release')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Giải phóng ghế đang giữ của người dùng' })
  async releaseSeats(@Req() req: any, @Body() dto: ReleaseSeatsDto) {
    const userId = req.user.sub || req.user.id;
    return this.seatHoldService.releaseHolds(userId, dto);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo đơn đặt vé xem phim (Server-side Pricing)' })
  async createMovieOrder(@Req() req: any, @Body() dto: CreateMovieOrderDto) {
    const userId = req.user.sub || req.user.id;
    return this.movieOrderService.createMovieOrder(userId, dto);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách đơn đặt vé của tôi' })
  async getMyOrders(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.movieOrderService.getUserOrders(userId);
  }

  @Get('orders/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết đơn đặt vé xem phim' })
  async getOrderById(@Req() req: any, @Param('orderId') orderId: string) {
    const userId = req.user.sub || req.user.id;
    return this.movieOrderService.getOrderById(userId, orderId);
  }

  @Post('orders/:orderId/reconcile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đối soát lại trạng thái đặt vé khi Cinema API Timeout' })
  async reconcileOrder(@Req() req: any, @Param('orderId') orderId: string) {
    const userId = req.user.sub || req.user.id;
    const order = await this.movieOrderService.getOrderById(userId, orderId);
    return this.movieBookingService.reconcileConfirmingBooking(order.id);
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách vé xem phim đã phát hành của tôi' })
  async getMyTickets(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.movieOrderService.getUserTickets(userId);
  }

  @Get('tickets/:ticketId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết vé xem phim và mã Barcode quét tại quầy' })
  async getTicketById(@Req() req: any, @Param('ticketId') ticketId: string) {
    const userId = req.user.sub || req.user.id;
    return this.movieOrderService.getTicketById(userId, ticketId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết bộ phim' })
  async getMovieById(@Param('id') id: string) {
    return this.movieOrderService.getMovieById(id);
  }
}