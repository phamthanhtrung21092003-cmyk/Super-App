import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

export default function ShippingTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="empty-timeline-text">
        Chưa có lịch trình cập nhật cho đơn hàng này.
      </div>
    );
  }

  return (
    <div className="shipping-timeline-container">
      <h4 className="timeline-title-heading">Lịch trình vận chuyển</h4>

      <div className="timeline-items-list">
        {timeline.map((item, idx) => {
          let statusClass = 'timeline-future';
          if (item.done) statusClass = 'timeline-completed';
          if (item.current) statusClass = 'timeline-current';
          if (item.error) statusClass = 'timeline-error';

          return (
            <div key={idx} className={`timeline-row-item ${statusClass}`}>
              <div className="timeline-node-icon">
                {item.done && <CheckCircle2 size={16} className="icon-done" />}
                {item.current && <Clock size={16} className="icon-current" />}
                {item.error && <AlertCircle size={16} className="icon-error" />}
                {!item.done && !item.current && !item.error && <Circle size={12} className="icon-future" />}
              </div>

              <div className="timeline-content-block">
                <span className="timeline-step-text">{item.step}</span>
                {item.time && <span className="timeline-time-text">{item.time}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
