import React, { useState, useEffect } from 'react';
import { X, Clock, ArrowDownLeft, ArrowUpRight, Edit2 } from 'lucide-react';
import sellerService from '../../data/sellerService';

export default function StockHistoryModal({ item, onClose }) {
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    if (item) {
      sellerService.getInventoryHistory(item.productId || item.id).then(logs => setHistoryList(logs));
    }
  }, [item]);

  if (!item) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card-box history-modal-large">
        <div className="modal-header-flex">
          <div>
            <h3 className="modal-title-text">
              <Clock size={18} /> Lịch sử xuất nhập kho
            </h3>
            <p className="modal-subtitle-text">
              Sản phẩm: <strong>{item.productName}</strong> (SKU: {item.sku})
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="history-table-wrapper">
          {historyList.length > 0 ? (
            <table className="history-data-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Loại giao dịch</th>
                  <th>Thay đổi</th>
                  <th>Tồn trước</th>
                  <th>Tồn sau</th>
                  <th>Người thực hiện</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map(h => {
                  const isAdd = h.change > 0;
                  return (
                    <tr key={h.id}>
                      <td className="time-col">{h.time}</td>
                      <td>
                        <span className={`type-tag ${isAdd ? 'add' : 'sub'}`}>
                          {isAdd ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />} {h.type}
                        </span>
                      </td>
                      <td className={`change-col ${isAdd ? 'green' : 'red'}`}>
                        {isAdd ? `+${h.change}` : h.change}
                      </td>
                      <td>{h.before}</td>
                      <td className="font-weight-bold">{h.after}</td>
                      <td>{h.user}</td>
                      <td className="note-col">{h.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="history-empty-state">
              <Clock size={32} color="var(--text-muted)" />
              <p>Chưa có lịch sử giao dịch tồn kho cho sản phẩm này.</p>
            </div>
          )}
        </div>

        <div className="modal-actions-flex justify-end">
          <button className="nav-btn-primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
