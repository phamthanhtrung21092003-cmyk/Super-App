import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'nestjs-pino';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  // 1. Khởi tạo giao dịch mới ở trạng thái PENDING
  async createTransaction(walletId: string, dto: CreateTransactionDto) {
    if (dto.idempotencyKey) {
      const existing = await this.prisma.transaction.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) {
        this.logger.warn(`Duplicate transaction request detected for idempotencyKey: ${dto.idempotencyKey}`);
        return existing; // Trả về giao dịch đã tồn tại
      }
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        walletId,
        amount: dto.amount,
        balanceBefore: 0, // Sẽ được cập nhật khi SUCCESS
        balanceAfter: 0,  // Sẽ được cập nhật khi SUCCESS
        type: dto.type,
        direction: dto.direction,
        status: TransactionStatus.PENDING,
        description: dto.description || null,
        referenceId: dto.referenceId || null,
        referenceType: dto.referenceType || null,
        idempotencyKey: dto.idempotencyKey || null,
        metadata: dto.metadata || null,
      },
    });

    this.logger.log(`Transaction PENDING created: ID ${transaction.id} for wallet ${walletId}`);
    return transaction;
  }

  // 2. Lấy danh sách lịch sử giao dịch của tôi (phân trang & bộ lọc)
  async getMyTransactions(userId: string, query: QueryTransactionDto) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wallet) {
      throw new NotFoundException('Ví điện tử không tồn tại');
    }

    const { page = 1, limit = 20, status, type } = query;
    const skip = (page - 1) * limit;

    const where: any = { walletId: wallet.id };
    if (status) where.status = status;
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. Lấy chi tiết một giao dịch (kiểm tra quyền sở hữu)
  async getTransactionById(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Giao dịch không tồn tại');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wallet || transaction.walletId !== wallet.id) {
      throw new ForbiddenException('Bạn không có quyền xem giao dịch này');
    }

    return transaction;
  }

  // 4. Xác nhận giao dịch thành công và cập nhật số dư ví (Atomic Prisma Transaction)
  async markSuccess(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Giao dịch không tồn tại');
    }

    // NGUYÊN TẮC: Chặn cộng tiền trùng lặp
    if (transaction.status !== TransactionStatus.PENDING) {
      this.logger.warn(`Transaction ID ${transactionId} is already processed with status: ${transaction.status}`);
      return transaction; // Bỏ qua không xử lý lại
    }

    return this.prisma.$transaction(async (tx) => {
      // Khóa và lấy thông tin ví để cập nhật số dư an toàn
      const wallet = await tx.wallet.findUnique({
        where: { id: transaction.walletId },
      });

      if (!wallet) {
        throw new NotFoundException('Ví điện tử liên kết không tồn tại');
      }

      if (wallet.status !== 'ACTIVE') {
        throw new BadRequestException('Ví điện tử đang bị khóa hoặc đóng băng');
      }

      const balanceBefore = Number(wallet.balance);
      const amount = Number(transaction.amount);
      let balanceAfter = balanceBefore;

      if (transaction.direction === 'CREDIT') {
        balanceAfter = balanceBefore + amount;
      } else if (transaction.direction === 'DEBIT') {
        const availableBalance = balanceBefore - Number(wallet.pendingBalance);
        if (availableBalance < amount) {
          throw new BadRequestException('Số dư khả dụng không đủ để thực hiện giao dịch');
        }
        balanceAfter = balanceBefore - amount;
      }

      // Cập nhật Wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      // Cập nhật Transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.SUCCESS,
          balanceBefore,
          balanceAfter,
        },
      });

      this.logger.log(
        `Transaction ID ${transactionId} SUCCESS. Wallet ID ${wallet.id}: Balance updated from ${balanceBefore} to ${balanceAfter}`,
      );

      return updatedTransaction;
    });
  }

  // 5. Xác nhận giao dịch thất bại
  async markFailed(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Giao dịch không tồn tại');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      return transaction;
    }

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.FAILED },
    });
  }

  // 6. Hủy giao dịch
  async cancelTransaction(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Giao dịch không tồn tại');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      return transaction;
    }

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.CANCELLED },
    });
  }
}
