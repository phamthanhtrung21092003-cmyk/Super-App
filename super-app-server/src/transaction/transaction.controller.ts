import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionEntity } from './transaction.entity';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@ApiTags('Wallet Transactions')
@Controller('wallet/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy lịch sử giao dịch ví của người dùng đăng nhập' })
  @ApiResponse({ status: 200, description: 'Lấy lịch sử giao dịch thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyTransactions(
    @CurrentUser() user: { id: string },
    @Query() query: QueryTransactionDto,
  ) {
    return this.transactionService.getMyTransactions(user.id, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy chi tiết giao dịch ví theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công', type: TransactionEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập giao dịch này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch' })
  async getTransactionById(
    @CurrentUser() user: { id: string },
    @Param('id') transactionId: string,
  ) {
    return this.transactionService.getTransactionById(user.id, transactionId);
  }
}
