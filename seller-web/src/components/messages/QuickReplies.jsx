import React from 'react';
import { Zap, X } from 'lucide-react';

export default function QuickReplies({ 
  templates = [], 
  onSelectTemplate, 
  onClose 
}) {
  const defaultTemplates = [
    'Chào bạn, shop có thể hỗ trợ gì cho bạn ạ?',
    'Shop đã kiểm tra và sản phẩm vẫn còn hàng nhé.',
    'Đơn hàng của bạn đang được xử lý.',
    'Cảm ơn bạn đã ủng hộ shop. Chúc bạn một ngày tốt lành!',
    'Bạn vui lòng cung cấp thêm chiều cao và cân nặng để shop tư vấn size chuẩn nhất nhé.'
  ];

  const listToRender = templates && templates.length > 0 ? templates : defaultTemplates;

  return (
    <div className="quick-replies-popover">
      <div className="quick-replies-header">
        <div className="quick-title-wrap">
          <Zap size={14} className="icon-gold" />
          <span className="quick-title">Mẫu câu trả lời nhanh</span>
        </div>
        {onClose && (
          <button type="button" className="quick-close-btn" onClick={onClose}>
            <X size={14} />
          </button>
        )}
      </div>

      <div className="quick-templates-list">
        {listToRender.map((tpl, idx) => (
          <button
            key={idx}
            type="button"
            className="quick-template-item"
            onClick={() => onSelectTemplate(tpl)}
          >
            <span className="template-num">{idx + 1}.</span>
            <span className="template-text">{tpl}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
