/**
 * Gemini AI Service for Seller Center
 * Powers:
 * 1. AI Product Copywriter (Mô tả sản phẩm chuẩn SEO)
 * 2. AI Smart Reply (Gợi ý trả lời tin nhắn khách hàng tức thì)
 * 3. AI Seller Advisor (Trợ lý tư vấn kinh doanh & chính sách bán hàng)
 */

export const getGeminiApiKey = () => {
  return localStorage.getItem('seller_gemini_api_key') || '';
};

export const setGeminiApiKey = (key) => {
  if (key) {
    localStorage.setItem('seller_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('seller_gemini_api_key');
  }
};

/**
 * Call Gemini API directly using Gemini 3.8 Flash or fallback to intelligent local engine
 */
async function callGeminiApi(prompt, systemInstruction = '') {
  const apiKey = getGeminiApiKey();

  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local generator:', err);
    }
  }

  return null;
}

/**
 * AI Product Description Generator
 */
export async function generateProductDescription({ name, category, features = '', price = 0 }) {
  const prompt = `Bạn là một chuyên gia sáng tạo nội dung E-commerce hàng đầu cho S-Shopping. 
Hãy viết một bài mô tả sản phẩm hấp dẫn, chuẩn SEO, có cấu trúc rõ ràng cho sản phẩm:
- Tên sản phẩm: ${name}
- Ngành hàng: ${category}
- Đặc điểm / Thông số: ${features || 'Chất lượng cao, thiết kế hiện đại, độ bền vượt trội'}
- Giá bán dự kiến: ${price ? price.toLocaleString('vi-VN') + ' đ' : 'Giá ưu đãi'}

Yêu cầu cấu trúc:
1. Đoạn mở đầu lôi cuốn (Hook)
2. Điểm nổi bật & Lợi ích chính (Bullet points)
3. Thông số kỹ thuật / Hướng dẫn sử dụng
4. Cam kết từ Shop & Chính sách đổi trả 7 ngày
5. Hashtags chuẩn SEO (#sshopping #dealhot #chinhhang)`;

  const aiText = await callGeminiApi(prompt, 'Bạn là trợ lý AI chuyên nghiệp cho người bán hàng trên sàn thương mại điện tử S-Shopping.');
  if (aiText) return aiText;

  // High-quality local generator fallback (always instant and reliable)
  return `🌟 ĐẶC ĐIỂM NỔI BẬT CỦA ${name.toUpperCase()}

${features ? `✨ ${features}` : '✨ Thiết kế cao cấp, đường nét tinh tế, mang lại trải nghiệm tiện ích vượt trội cho người dùng.'}
✨ Chất liệu cao cấp, độ hoàn thiện tinh xảo, đáp ứng tiêu chuẩn kiểm định nghiêm ngặt.
✨ Phù hợp cho nhu cầu sử dụng hàng ngày và làm quà tặng sang trọng, ý nghĩa.

📋 THÔNG SỐ KỸ THUẬT:
• Danh mục: ${category || 'Sản phẩm cao cấp'}
• Tình trạng: Hàng mới 100%, nguyên hộp (Fullbox)
• Phân phối chính hãng: S-Shopping Store Official
• Xuất xứ: Tiêu chuẩn chính hãng xuất khẩu

🛡️ CHÍNH SÁCH BÁN HÀNG & CAM KẾT TỪ SHOP:
1. Cam kết hàng chính hãng 100% - Hoàn tiền 200% nếu phát hiện hàng giả, hàng nhái.
2. Hỗ trợ 1 đổi 1 trong vòng 7 ngày nếu có lỗi từ nhà sản xuất.
3. Giao hàng hỏa tốc toàn quốc, kiểm tra hàng trước khi thanh toán (Ship COD).
4. Đội ngũ CSKH hỗ trợ tư vấn 24/7 nhiệt tình và chu đáo.

🎁 Ưu đãi đặc biệt: Đặt hàng ngay hôm nay để nhận voucher giảm giá và quà tặng bất ngờ từ Shop!

#sshopping #chinhhang #uudai #giarenhat #${(category || 'sanpham').toLowerCase().replace(/\s+/g, '')} #freeship`;
}

/**
 * AI Smart Reply for Customer Chat
 */
export async function generateSmartReplies(customerMessage, orderContext = null) {
  const prompt = `Khách hàng vừa nhắn tin: "${customerMessage}". 
Thông tin đơn hàng liên quan: ${orderContext ? JSON.stringify(orderContext) : 'Không có'}.
Hãy tạo ra đúng 3 câu trả lời ngắn gọn, lịch sự, thân thiện và chuyên nghiệp bằng tiếng Việt để người bán gửi ngay cho khách.
Trả về định dạng JSON: ["câu 1", "câu 2", "câu 3"]`;

  const aiText = await callGeminiApi(prompt);
  if (aiText) {
    try {
      const match = aiText.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {
      // fallback
    }
  }

  // Smart Contextual Local Rule Engine
  const lower = customerMessage.toLowerCase();

  if (lower.includes('còn hàng') || lower.includes('còn không') || lower.includes('size')) {
    return [
      'Dạ chào bạn, sản phẩm này shop hiện vẫn còn sẵn hàng ạ! Bạn đặt sớm shop gửi ngay trong hôm nay nhé ạ.',
      'Dạ còn hàng bạn nha. Bạn cao và nặng bao nhiêu để shop tư vấn chuẩn kích thước cho bạn nhé?',
      'Dạ hàng có sẵn số lượng ít bạn ơi, bạn bấm Mua Ngay để giữ đơn và nhận ưu đãi freeship nhé!'
    ];
  }

  if (lower.includes('ship') || lower.includes('giao hàng') || lower.includes('bao lâu') || lower.includes('khi nào')) {
    return [
      'Dạ đơn hàng nội thành thường giao trong 1-2 ngày, các tỉnh khác khoảng 2-4 ngày là nhận được ạ!',
      'Dạ shop đóng gói và bàn giao cho ĐVVC trong vòng 24h, bạn theo dõi hành trình đơn tại mục Đơn hàng nhé.',
      'Dạ hiện shop đang hỗ trợ Freeship cho đơn từ 200k, bạn áp mã voucher ở bước thanh toán nha!'
    ];
  }

  if (lower.includes('giảm giá') || lower.includes('voucher') || lower.includes('bớt') || lower.includes('mã')) {
    return [
      'Dạ shop đang có voucher giảm 10% tại trang chủ gian hàng, bạn nhớ bấm Lưu mã để áp dụng nhé ạ!',
      'Dạ giá trên sàn hiện tại đã là giá ưu đãi tốt nhất rồi ạ, kèm chính sách bảo hành chính hãng bạn yên tâm nhé.',
      'Dạ nếu bạn mua từ 2 sản phẩm trở lên, shop có mã giảm thêm 30k gửi tặng bạn nha!'
    ];
  }

  if (lower.includes('bảo hành') || lower.includes('đổi trả') || lower.includes('lỗi')) {
    return [
      'Dạ sản phẩm được bảo hành chính hãng 12 tháng và hỗ trợ 1 đổi 1 trong 7 ngày nếu có lỗi bạn nhé!',
      'Dạ bạn gửi giúp shop video hoặc hình ảnh tình trạng sản phẩm để shop hỗ trợ đổi mới ngay cho bạn ạ.',
      'Dạ bạn hoàn toàn yên tâm, shop cam kết xử lý đổi trả miễn phí tận nhà cho bạn nếu hàng không đúng mô tả ạ!'
    ];
  }

  // Default pleasant greetings & support
  return [
    'Dạ Shop xin chào bạn! Shop có thể hỗ trợ thông tin gì cho bạn ạ?',
    'Dạ cảm ơn bạn đã quan tâm đến sản phẩm của Shop. Bạn cần tư vấn thêm chi tiết nào ạ?',
    'Dạ bạn đợi shop kiểm tra và phản hồi lại bạn ngay nhé!'
  ];
}

/**
 * AI Seller Advisor: Answers policy, operations, or growth questions
 */
export async function askSellerAdvisor(question) {
  const prompt = `Bạn là Trợ lý AI Cố vấn Kinh doanh của Kênh Người Bán S-Shopping.
Câu hỏi của người bán: "${question}"
Hãy trả lời súc tích, cụ thể, thực tế và dễ áp dụng nhất để giúp người bán tối ưu vận hành hoặc tăng doanh thu.`;

  const aiText = await callGeminiApi(prompt);
  if (aiText) return aiText;

  // Contextual fallback advice
  const q = question.toLowerCase();
  if (q.includes('hoa hồng') || q.includes('phí sàn')) {
    return 'Phí sàn S-Shopping hiện đang được MIỄN PHÍ 100% trong 30 ngày đầu tiên cho gian hàng mới. Sau đó, phí cố định là 2.5% cho mỗi đơn hàng thành công, thuộc nhóm thấp nhất thị trường.';
  }
  if (q.includes('livestream') || q.includes('live')) {
    return 'Mẹo tăng đơn Livestream S-Shopping: Ghim từ 3-5 sản phẩm chủ lực có giá deal sốc 9k/19k để kéo mắt xem đầu live. Tung Flash Sale trong khung giờ vàng 12h-13h và 20h-22h để tối đa tỷ lệ chốt đơn.';
  }
  if (q.includes('vận chuyển') || q.includes('giao chậm')) {
    return 'Để giảm tỷ lệ giao chậm, bạn nên xác nhận và đóng gói đơn hàng trước 14:00 hàng ngày để các đơn vị vận chuyển (GHN, Viettel Post, V-life Delivery) kịp lấy trong ca chiều.';
  }

  return 'Trợ lý AI S-Shopping khuyến nghị: Hãy cập nhật hình ảnh sản phẩm sắc nét, tối ưu từ khóa SEO trong tiêu đề và phản hồi tin nhắn khách hàng trong dưới 5 phút để đạt danh hiệu Shop Yêu Thích!';
}
