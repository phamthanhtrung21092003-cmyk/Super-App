import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FcmPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface FcmSendResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
  messageId?: string;
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private isSimulationMode = true;
  private fcmServerKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.fcmServerKey = this.configService.get<string>('FCM_SERVER_KEY');
    if (this.fcmServerKey) {
      this.isSimulationMode = false;
      this.logger.log('FCM Service khởi tạo với Production Server Key.');
    } else {
      this.isSimulationMode = true;
      this.logger.log('FCM Service chạy ở chế độ SIMULATION / DEV MODE (An toàn, ghi nhận và mô phỏng push chuẩn).');
    }
  }

  /**
   * Gửi Push Notification tới danh sách FCM device tokens
   * @param tokens Mảng FCM tokens
   * @param payload Nội dung thông báo và data payload
   * @returns Kết quả gửi và danh sách token hỏng cần deactivate
   */
  async sendMulticast(tokens: string[], payload: FcmPayload): Promise<FcmSendResult> {
    if (!tokens || tokens.length === 0) {
      return { success: true, successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    // Lọc các token rỗng hoặc trùng lặp
    const uniqueTokens = Array.from(new Set(tokens.filter((t) => typeof t === 'string' && t.trim().length > 0)));

    if (uniqueTokens.length === 0) {
      return { success: true, successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    try {
      if (this.isSimulationMode) {
        // MÔ PHỎNG FCM ĐẦY ĐỦ (DEV & TEST)
        const invalidTokens: string[] = [];
        let successCount = 0;
        let failureCount = 0;

        for (const token of uniqueTokens) {
          if (token.startsWith('invalid_') || token.includes('expired')) {
            invalidTokens.push(token);
            failureCount++;
            this.logger.warn(`[FCM-SIM] Token không hợp lệ / hết hạn: ${token.substring(0, 15)}...`);
          } else {
            successCount++;
          }
        }

        this.logger.log(
          `[FCM-SIM] Đã bắn Push Notification tới ${successCount}/${uniqueTokens.length} thiết bị: "${payload.title}" - Body: "${payload.body}" - DeepLink: "${payload.data?.deepLink || 'N/A'}"`,
        );

        return {
          success: true,
          successCount,
          failureCount,
          invalidTokens,
          messageId: `projects/v-life-food/messages/sim_${Date.now()}`,
        };
      }

      // TRƯỜNG HỢP CÓ FCM_SERVER_KEY: GỬI HTTP REQUEST SANG GOOGLE FCM LEGACY / REST API
      const body = {
        registration_ids: uniqueTokens,
        notification: {
          title: payload.title,
          body: payload.body,
          sound: 'default',
        },
        data: payload.data || {},
        priority: 'high',
      };

      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${this.fcmServerKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`FCM HTTP Error [${response.status}]: ${errorText}`);
        return { success: false, successCount: 0, failureCount: uniqueTokens.length, invalidTokens: [] };
      }

      const result: any = await response.json();
      const invalidTokens: string[] = [];

      if (Array.isArray(result.results)) {
        result.results.forEach((resItem: any, index: number) => {
          if (
            resItem.error === 'NotRegistered' ||
            resItem.error === 'InvalidRegistration' ||
            resItem.error === 'MismatchSenderId'
          ) {
            invalidTokens.push(uniqueTokens[index]);
          }
        });
      }

      this.logger.log(
        `FCM Push Result: ${result.success || 0} thành công, ${result.failure || 0} thất bại, ${invalidTokens.length} invalid tokens`,
      );

      return {
        success: true,
        successCount: result.success || 0,
        failureCount: result.failure || 0,
        invalidTokens,
        messageId: result.multicast_id ? String(result.multicast_id) : undefined,
      };
    } catch (error: any) {
      // TUYỆT ĐỐI KHÔNG CRASH NGHIỆP VỤ CHÍNH
      this.logger.warn(`Lỗi khi gửi FCM Push Notification (Silent catch): ${error.message}`);
      return {
        success: false,
        successCount: 0,
        failureCount: uniqueTokens.length,
        invalidTokens: [],
      };
    }
  }
}
