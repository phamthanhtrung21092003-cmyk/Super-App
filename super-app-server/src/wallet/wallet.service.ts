import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletStatus } from '@prisma/client';
import { Logger } from 'nestjs-pino';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  private generateWalletNumber(): string {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    return `VL${randomDigits}`;
  }

  async createWallet(tx: any, userId: string) {
    let walletNumber = this.generateWalletNumber();
    
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const existing = await tx.wallet.findUnique({
        where: { walletNumber },
        select: { id: true },
      });
      if (!existing) {
        isUnique = true;
      } else {
        walletNumber = this.generateWalletNumber();
        attempts++;
      }
    }

    const wallet = await tx.wallet.create({
      data: {
        userId,
        walletNumber,
        balance: 0,
        pendingBalance: 0,
        rewardPoints: 0,
        currency: 'VND',
        status: WalletStatus.ACTIVE,
      },
    });

    this.logger.log(`Wallet created: ID ${wallet.id}, number ${wallet.walletNumber} for user ${userId}`);
    return wallet;
  }

  async getMyWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      this.logger.error(`Wallet not found for user ${userId}`);
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async updateWalletStatus(userId: string, status: WalletStatus) {
    const wallet = await this.getMyWallet(userId);
    return this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { status },
    });
  }
}
