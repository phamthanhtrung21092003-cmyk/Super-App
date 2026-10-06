/**
 * soundService.ts
 * ─────────────────────────────────────────────────────────
 * Âm thanh báo động và rung cho Merchant App khi có đơn mới.
 * Sử dụng Web Audio API (không phụ thuộc file ngoài, không lo lỗi mạng/CORS).
 * Chạy mượt mà trên Chrome LAN mode, Android WebView và Web.
 * ─────────────────────────────────────────────────────────
 */

import { Platform } from 'react-native';

class SoundService {
  private audioCtx: any = null;
  private intervalId: any = null;
  private isPlaying: boolean = false;

  private initAudio() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass && !this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  /**
   * Phát một hồi chuông kép (Ding-Dong / Alert tone)
   */
  private playChime() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Note 1: 987.77 Hz (B5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.6, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: 1318.51 Hz (E6) vang to
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318.51, now + 0.18);
      gain2.gain.setValueAtTime(0.7, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.65);

      // Rung thiết bị nếu hỗ trợ
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
    } catch (err) {
      console.warn('[SoundService] Lỗi phát âm thanh:', err);
    }
  }

  /**
   * Bắt đầu chuỗi chuông báo động lặp lại liên tục cho đến khi nhận đơn
   */
  startAlarm() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    console.log('[SoundService] Đang bật chuông báo đơn mới liên tục...');

    // Phát ngay lập tức
    this.playChime();

    // Lặp lại mỗi 2.5 giây
    this.intervalId = setInterval(() => {
      if (this.isPlaying) {
        this.playChime();
      }
    }, 2500);
  }

  /**
   * Dừng chuông báo động
   */
  stopAlarm() {
    if (!this.isPlaying) return;
    console.log('[SoundService] Đã tắt chuông báo đơn.');
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Trạng thái chuông hiện tại
   */
  isAlarming(): boolean {
    return this.isPlaying;
  }
}

export const soundService = new SoundService();
