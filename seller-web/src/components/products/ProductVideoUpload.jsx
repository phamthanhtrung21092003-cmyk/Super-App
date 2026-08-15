import React, { useState } from 'react';
import { Video, Film, Trash2, PlayCircle, Info, Plus } from 'lucide-react';

export default function ProductVideoUpload({
  videos = [],
  onChangeVideos
}) {
  const [isAddingMock, setIsAddingMock] = useState(false);

  const handleAddMockVideo = () => {
    setIsAddingMock(true);
    setTimeout(() => {
      const mockVideo = {
        id: `vid_${Date.now()}`,
        name: 'video_gioi_thieu_san_pham.mp4',
        duration: '0:45',
        size: '12.4 MB',
        thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
      };
      onChangeVideos([...videos, mockVideo]);
      setIsAddingMock(false);
    }, 400);
  };

  const handleDeleteVideo = (idToDelete) => {
    onChangeVideos(videos.filter(v => v.id !== idToDelete));
  };

  return (
    <div className="product-form-card">
      <div className="form-card-header">
        <h3 className="form-card-title">Video sản phẩm</h3>
        <span className="form-card-subtitle">
          Video giúp khách hàng hiểu rõ hơn về sản phẩm, tính năng và trải nghiệm thực tế
        </span>
      </div>

      <div className="form-card-body">
        {videos.length === 0 ? (
          <div className="video-empty-state-box">
            <div className="video-icon-circle">
              <Film size={26} />
            </div>
            <p className="video-empty-title">Chưa có video giới thiệu</p>
            <p className="video-empty-sub">
              Tải lên video định dạng MP4, MOV (Thời lượng tối đa 60s, dung lượng tối đa 50MB)
            </p>
            <button
              type="button"
              className="btn-add-video"
              onClick={handleAddMockVideo}
              disabled={isAddingMock}
            >
              {isAddingMock ? (
                <span>Đang xử lý video...</span>
              ) : (
                <>
                  <Plus size={15} /> + Thêm video sản phẩm
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="video-preview-list">
            {videos.map((vid) => (
              <div key={vid.id} className="video-item-card">
                <div className="video-thumb-container">
                  <img src={vid.thumbnail} alt={vid.name} className="video-thumb-img" />
                  <div className="video-play-overlay">
                    <PlayCircle size={28} />
                  </div>
                  <span className="video-duration-tag">{vid.duration}</span>
                </div>

                <div className="video-meta-info">
                  <span className="video-name-text">{vid.name}</span>
                  <span className="video-size-text">{vid.size} • Đã kiểm duyệt định dạng</span>
                </div>

                <button
                  type="button"
                  className="btn-delete-video"
                  onClick={() => handleDeleteVideo(vid.id)}
                  title="Xóa video"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="video-helper-tip">
          <Info size={13} />
          <span>Sản phẩm có video thường đạt lượt xem và tỷ lệ đặt hàng cao hơn 2.5 lần.</span>
        </div>
      </div>
    </div>
  );
}
