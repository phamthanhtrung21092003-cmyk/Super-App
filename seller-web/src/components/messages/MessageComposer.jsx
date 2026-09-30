import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Plus, ShoppingBag, Package, Zap, Sparkles } from 'lucide-react';
import QuickReplies from './QuickReplies';
import { generateSmartReplies } from '../../services/geminiService';

export default function MessageComposer({
  onSendMessage,
  onOpenProductPicker,
  onOpenOrderPicker,
  quickReplies = [],
  lastCustomerMessage = ''
}) {
  const [inputText, setInputText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    generateSmartReplies(lastCustomerMessage || 'Dạ chào shop').then(replies => {
      if (replies && replies.length > 0) {
        setSmartReplies(replies);
      }
    });
  }, [lastCustomerMessage]);

  const emojis = ['👋', '😊', '👍', '❤️', '🔥', '🎉', '📦', '🛍️', '💯', '✨'];

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage({ content: inputText.trim() });
    setInputText('');
    setShowQuickReplies(false);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectQuickReply = (tpl) => {
    setInputText(tpl);
    setShowQuickReplies(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleInsertEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="message-composer-container">
      {/* Quick Replies Popover */}
      {showQuickReplies && (
        <QuickReplies 
          templates={quickReplies}
          onSelectTemplate={handleSelectQuickReply}
          onClose={() => setShowQuickReplies(false)}
        />
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="emoji-picker-popover">
          <div className="emoji-grid">
            {emojis.map((em, i) => (
              <button 
                key={i} 
                type="button" 
                className="emoji-btn"
                onClick={() => handleInsertEmoji(em)}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ✨ Gemini AI Smart Reply Bar */}
      {smartReplies.length > 0 && (
        <div className="smart-replies-bar" style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 14px',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
          borderBottom: '1px solid #E0E7FF',
          alignItems: 'center',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4F46E5', fontSize: '11px', fontWeight: '800', whiteSpace: 'nowrap' }}>
            <Sparkles size={13} color="#4F46E5" />
            <span>AI Gợi ý:</span>
          </div>
          {smartReplies.map((reply, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectQuickReply(reply)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #C7D2FE',
                color: '#312E81',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
              title="Nhấp để chèn câu trả lời thông minh này"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Action Toolbar */}
      <div className="composer-toolbar-row">
        <div className="composer-left-actions">
          <button 
            type="button" 
            className="composer-tool-btn"
            title="Đính kèm thêm"
          >
            <Plus size={16} />
          </button>

          <button 
            type="button" 
            className={`composer-tool-btn ${showEmojiPicker ? 'active' : ''}`}
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowQuickReplies(false);
            }}
            title="Chèn biểu tượng cảm xúc"
          >
            <Smile size={16} />
          </button>

          <button 
            type="button" 
            className="composer-pill-btn"
            onClick={onOpenProductPicker}
            title="Chọn và gửi thẻ sản phẩm từ Catalog"
          >
            <ShoppingBag size={14} className="icon-green" /> Gửi sản phẩm
          </button>

          <button 
            type="button" 
            className="composer-pill-btn"
            onClick={onOpenOrderPicker}
            title="Chọn và gửi thẻ đơn hàng của khách"
          >
            <Package size={14} className="icon-blue" /> Gửi đơn hàng
          </button>
        </div>

        <button 
          type="button" 
          className={`composer-quick-reply-toggle ${showQuickReplies ? 'active' : ''}`}
          onClick={() => {
            setShowQuickReplies(!showQuickReplies);
            setShowEmojiPicker(false);
          }}
        >
          <Zap size={14} className="icon-gold" /> Trả lời nhanh
        </button>
      </div>

      {/* Input Textarea & Send Button */}
      <div className="composer-input-wrapper">
        <textarea 
          ref={textareaRef}
          rows={2}
          placeholder="Nhập tin nhắn… (Enter để gửi, Shift + Enter để xuống dòng)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="composer-textarea"
        />

        <button 
          type="button" 
          className="btn-composer-send"
          disabled={!inputText.trim()}
          onClick={handleSend}
          title="Gửi tin nhắn"
        >
          <Send size={16} />
          <span className="send-text">Gửi</span>
        </button>
      </div>
    </div>
  );
}
