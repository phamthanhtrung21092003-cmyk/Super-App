/**
 * AI Transport Intelligence Service
 * Phân tích bối cảnh thời gian thực (Thời tiết, Giao thông giờ cao điểm, Vị trí)
 * và Xử lý lệnh giọng nói Đặt xe rảnh tay (Voice-to-Ride).
 */

export interface WeatherContext {
  condition: 'rain' | 'sunny' | 'cloudy' | 'storm';
  temperature: string;
  description: string;
  humidity: string;
}

export interface TrafficContext {
  level: 'low' | 'moderate' | 'heavy' | 'jam';
  label: string;
  delayEstimate: string;
}

export interface AITransportAdvice {
  weather: WeatherContext;
  traffic: TrafficContext;
  headline: string;
  body: string;
  recommendedService: 'bike' | 'ev' | 'car' | 'delivery';
  estimatedWaitMinutes: number;
  surgeMultiplier: number;
  badgeText: string;
}

export interface VoiceBookingResult {
  rawText: string;
  serviceType: 'bike' | 'ev' | 'car' | 'delivery';
  serviceName: string;
  destinationName: string;
  destinationAddress: string;
  estimatedPrice: number;
  confidence: number;
}

class AITransportService {
  /**
   * Phân tích thời gian thực và vị trí để đưa ra lời khuyên tối ưu
   */
  public async getDynamicAdvice(coords?: { lat: number; lng: number }): Promise<AITransportAdvice> {
    const now = new Date();
    const hour = now.getHours();

    // 1. Phân tích khung giờ cao điểm
    const isMorningRush = hour >= 7 && hour <= 9;
    const isEveningRush = hour >= 16 && hour <= 19;
    const isNight = hour >= 22 || hour <= 5;

    let traffic: TrafficContext = {
      level: 'moderate',
      label: 'Giao thông thông thoáng',
      delayEstimate: '0 - 2 phút',
    };

    if (isMorningRush) {
      traffic = {
        level: 'heavy',
        label: 'Cao điểm buổi sáng',
        delayEstimate: '+10 phút trên các trục chính',
      };
    } else if (isEveningRush) {
      traffic = {
        level: 'jam',
        label: 'Giờ tan tầm đông đúc',
        delayEstimate: '+15 phút (Kẹt xe đường Nguyễn Trãi, Vành đai 3)',
      };
    } else if (isNight) {
      traffic = {
        level: 'low',
        label: 'Đường đêm vắng vẻ',
        delayEstimate: 'Tốc độ lưu thông tối đa',
      };
    }

    // 2. Dự báo thời tiết thực tế theo mùa và giờ
    // Giả lập mưa chiều nhiệt đới thường gặp ở Hà Nội / TP.HCM
    const isRainyTime = hour >= 13 && hour <= 18;
    const weather: WeatherContext = isRainyTime
      ? {
          condition: 'rain',
          temperature: '29°C',
          description: 'Trời có mưa dông nhẹ, đường trơn trượt',
          humidity: '85%',
        }
      : {
          condition: isNight ? 'cloudy' : 'sunny',
          temperature: isNight ? '26°C' : '33°C',
          description: isNight ? 'Trời mát mẻ về đêm' : 'Trời nắng ráo, tầm nhìn tốt',
          humidity: '68%',
        };

    // 3. Ra quyết định gợi ý từ AI
    let recommendedService: 'bike' | 'ev' | 'car' | 'delivery' = 'ev';
    let headline = 'AI Trợ lý Gợi ý Di chuyển';
    let body = '';
    let surgeMultiplier = 1.0;
    let estimatedWaitMinutes = 3;
    let badgeText = 'Đề xuất tối ưu';

    if (weather.condition === 'rain' || weather.condition === 'storm') {
      recommendedService = 'ev';
      headline = 'Trời mưa - Ưu tiên Taxi điện Xanh';
      body = 'Khu vực đang có mưa dông, đường trơn. Hãy chọn Taxi điện 4-7 chỗ để có máy lạnh sạch sẽ, an toàn và không bị ướt.';
      surgeMultiplier = 1.15;
      estimatedWaitMinutes = 5;
      badgeText = 'Tránh mưa & An toàn';
    } else if (traffic.level === 'jam' || traffic.level === 'heavy') {
      recommendedService = 'bike';
      headline = 'Giờ cao điểm - Đi Xe máy công nghệ';
      body = 'Các tuyến đường trục chính đang ùn ứ. Xe máy là phương án nhanh nhất để kịp giờ làm và di chuyển linh hoạt.';
      surgeMultiplier = 1.1;
      estimatedWaitMinutes = 2;
      badgeText = 'Lách kẹt xe nhanh nhất';
    } else if (isNight) {
      recommendedService = 'car';
      headline = 'Chuyến đi đêm an toàn & tiện nghi';
      body = 'Đã muộn rồi, hãy chọn Ô tô để về nhà an toàn, tài xế xác thực danh tính bảo mật 100%.';
      estimatedWaitMinutes = 4;
      badgeText = 'An tâm đêm muộn';
    } else {
      recommendedService = 'ev';
      headline = 'Thời tiết lý tưởng để di chuyển';
      body = 'Thời gian ghép xe trung bình chỉ 2 phút. Taxi điện VinFast giá ưu đãi êm ái đang sẵn sàng gần bạn.';
      estimatedWaitMinutes = 2;
      badgeText = 'Giá tốt giờ vàng';
    }

    return {
      weather,
      traffic,
      headline,
      body,
      recommendedService,
      estimatedWaitMinutes,
      surgeMultiplier,
      badgeText,
    };
  }

  /**
   * Xử lý giọng nói của người dùng (Voice-to-Ride NLP Parser)
   */
  public parseVoiceBooking(transcription: string): VoiceBookingResult {
    const text = transcription.toLowerCase();

    // Phát hiện loại phương tiện
    let serviceType: 'bike' | 'ev' | 'car' | 'delivery' = 'ev';
    let serviceName = 'Taxi điện Xanh';
    let baseRate = 65000;

    if (text.includes('xe máy') || text.includes('xe ôm') || text.includes('bike')) {
      serviceType = 'bike';
      serviceName = 'Xe máy Công nghệ';
      baseRate = 32000;
    } else if (text.includes('giao hàng') || text.includes('ship') || text.includes('gửi đồ')) {
      serviceType = 'delivery';
      serviceName = 'Giao hàng Siêu tốc';
      baseRate = 28000;
    } else if (text.includes('ô tô') || text.includes('xe hơi') || text.includes('7 chỗ')) {
      serviceType = 'car';
      serviceName = 'Xe hơi Cao cấp';
      baseRate = 85000;
    }

    // Phát hiện địa điểm đến
    let destinationName = 'Royal City';
    let destinationAddress = '72A Nguyễn Trãi, Thanh Xuân, Hà Nội';
    let distanceKm = 4.8;

    if (text.includes('keangnam') || text.includes('mễ trì')) {
      destinationName = 'Keangnam Landmark 72';
      destinationAddress = 'Khu E6 Phạm Hùng, Nam Từ Liêm, Hà Nội';
      distanceKm = 6.2;
    } else if (text.includes('sân bay') || text.includes('nội bài')) {
      destinationName = 'Sân bay Quốc tế Nội Bài';
      destinationAddress = 'Xã Phú Minh, Huyện Sóc Sơn, Hà Nội';
      distanceKm = 27.5;
    } else if (text.includes('bờ hồ') || text.includes('hoàn kiếm')) {
      destinationName = 'Hồ Hoàn Kiếm';
      destinationAddress = 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội';
      distanceKm = 7.1;
    } else if (text.includes('công ty') || text.includes('chỗ làm')) {
      destinationName = 'Tòa nhà FPT Tower';
      destinationAddress = 'Số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội';
      distanceKm = 3.5;
    }

    const estimatedPrice = Math.round(baseRate + (distanceKm * (serviceType === 'bike' ? 7000 : 13000)) / 1000) * 1000;

    return {
      rawText: transcription,
      serviceType,
      serviceName,
      destinationName,
      destinationAddress,
      estimatedPrice,
      confidence: 0.96,
    };
  }
}

export const aiTransportService = new AITransportService();
