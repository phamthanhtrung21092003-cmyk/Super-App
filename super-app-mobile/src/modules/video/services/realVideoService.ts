import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import apiClient, { getBaseURL } from '../../../services/apiClient';
import {
  IVideoService,
  UploadResult,
  UploadProgressCallback,
  VideoItem,
  FeedParams,
  FeedResponse,
  CommentItem,
} from '../types';

/**
 * Axios instance chuyên dụng cho upload video:
 * - Không áp đặt timeout 10 giây (timeout: 5 phút)
 * - Tự động đính kèm accessToken nếu có
 */
const createUploadClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 300000, // 5 phút cho video dung lượng lớn
  });

  instance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

const uploadClient = createUploadClient();

export const realVideoService: IVideoService = {
  /**
   * Upload file video và ảnh thumbnail bìa lên máy chủ với tiến trình %
   */
  async uploadFiles(
    videoUri: string,
    thumbnailUri?: string,
    onProgress?: UploadProgressCallback,
    cancelSignal?: AbortSignal,
  ): Promise<UploadResult> {
    const formData = new FormData();

    if (Platform.OS === 'web' || videoUri.startsWith('blob:') || videoUri.startsWith('data:')) {
      // Xử lý nạp Blob trên môi trường trình duyệt Web
      const videoRes = await fetch(videoUri);
      const videoBlob = await videoRes.blob();
      let videoFilename = videoUri.split('/').pop()?.split('?')[0] || 'upload_video.mp4';
      if (!/\.(mp4|mov|webm)$/i.test(videoFilename)) {
        videoFilename = `${videoFilename}.mp4`;
      }
      formData.append('video', videoBlob, videoFilename);

      if (thumbnailUri) {
        const thumbRes = await fetch(thumbnailUri);
        const thumbBlob = await thumbRes.blob();
        let thumbFilename = thumbnailUri.split('/').pop()?.split('?')[0] || 'thumbnail.jpg';
        if (!/\.(jpg|jpeg|png|webp)$/i.test(thumbFilename)) {
          thumbFilename = `${thumbFilename}.jpg`;
        }
        formData.append('thumbnail', thumbBlob, thumbFilename);
      }
    } else {
      // Xử lý nạp file trên Native (iOS / Android)
      let filename = videoUri.split('/').pop() || 'upload_video.mp4';
      if (!/\.(mp4|mov|webm)$/i.test(filename)) {
        filename = `${filename}.mp4`;
      }
      const match = /\.(\w+)$/.exec(filename);
      const ext = match?.[1]?.toLowerCase() || 'mp4';
      const mimeType = ext === 'mov' ? 'video/quicktime' : 'video/mp4';

      formData.append('video', {
        uri: videoUri,
        name: filename,
        type: mimeType,
      } as any);

      if (thumbnailUri) {
        let thumbName = thumbnailUri.split('/').pop() || 'thumbnail.jpg';
        if (!/\.(jpg|jpeg|png|webp)$/i.test(thumbName)) {
          thumbName = `${thumbName}.jpg`;
        }
        formData.append('thumbnail', {
          uri: thumbnailUri,
          name: thumbName,
          type: 'image/jpeg',
        } as any);
      }
    }

    const headers: Record<string, any> = {};
    if (Platform.OS === 'web') {
      headers['Content-Type'] = undefined;
    } else {
      headers['Content-Type'] = 'multipart/form-data';
    }

    const response = await uploadClient.post('/videos/upload', formData, {
      headers,
      signal: cancelSignal,
      transformRequest: (data) => data,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent, progressEvent.loaded, progressEvent.total);
        }
      },
    });

    return response.data?.data;
  },

  /**
   * Tạo bài đăng video mới với đầy đủ metadata
   */
  async createVideoPost(dto: {
    videoUrl: string;
    thumbnailUrl?: string | null;
    caption?: string;
    musicTitle?: string;
    location?: string;
    serviceId?: string;
    duration?: number;
    width?: number;
    height?: number;
    sizeBytes?: number;
    mimeType?: string;
    hashtags?: string[];
  }): Promise<VideoItem> {
    const response = await uploadClient.post('/videos', dto);
    return response.data?.data;
  },

  /**
   * Lấy chi tiết một video theo ID
   */
  async getVideoById(id: string): Promise<VideoItem> {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data?.data;
  },

  /**
   * Lấy danh sách video feed (TikTok-like Cursor Pagination)
   */
  async getFeed(params?: FeedParams): Promise<FeedResponse> {
    const response = await apiClient.get('/videos/feed', { params });
    return response.data?.data || { items: [], nextCursor: null, hasMore: false };
  },

  /**
   * Thả tim video
   */
  async likeVideo(videoId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }> {
    const response = await apiClient.post(`/videos/${videoId}/like`);
    return response.data;
  },

  /**
   * Hủy thả tim video
   */
  async unlikeVideo(videoId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }> {
    const response = await apiClient.delete(`/videos/${videoId}/like`);
    return response.data;
  },

  /**
   * Lưu / Bỏ lưu video vào mục yêu thích (Toggle)
   */
  async toggleSaveVideo(videoId: string): Promise<{ success: boolean; isSaved: boolean; savesCount: number }> {
    const response = await apiClient.post(`/videos/${videoId}/save`);
    return response.data;
  },

  /**
   * Lấy danh sách bình luận của video
   */
  async getVideoComments(videoId: string): Promise<CommentItem[]> {
    const response = await apiClient.get(`/videos/${videoId}/comments`);
    return response.data?.data || [];
  },

  /**
   * Gửi bình luận về video
   */
  async createVideoComment(videoId: string, content: string, parentId?: string): Promise<CommentItem> {
    const response = await apiClient.post(`/videos/${videoId}/comments`, { content, parentId });
    return response.data?.data;
  },

  /**
   * Ghi nhận lượt xem video
   */
  async recordView(videoId: string, watchDuration?: number): Promise<{ success: boolean; viewsCount: number }> {
    const response = await apiClient.post(`/videos/${videoId}/view`, { watchDuration });
    return response.data;
  },

  /**
   * Theo dõi (Follow) một creator/user
   */
  async followUser(userId: string): Promise<{ success: boolean; isFollowing: boolean }> {
    const response = await apiClient.post(`/users/${userId}/follow`);
    return response.data;
  },

  /**
   * Bỏ theo dõi (Unfollow) một creator/user
   */
  async unfollowUser(userId: string): Promise<{ success: boolean; isFollowing: boolean }> {
    const response = await apiClient.delete(`/users/${userId}/follow`);
    return response.data;
  },

  /**
   * Thích (Like) bình luận
   */
  async likeComment(videoId: string, commentId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }> {
    const response = await apiClient.post(`/videos/${videoId}/comments/${commentId}/like`);
    return response.data;
  },

  /**
   * Bỏ thích (Unlike) bình luận
   */
  async unlikeComment(videoId: string, commentId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }> {
    const response = await apiClient.delete(`/videos/${videoId}/comments/${commentId}/like`);
    return response.data;
  },

  /**
   * Xóa bình luận của chính mình
   */
  async deleteComment(videoId: string, commentId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/videos/${videoId}/comments/${commentId}`);
    return response.data;
  },
};
