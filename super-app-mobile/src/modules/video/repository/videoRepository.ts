import { videoService } from '../services';
import {
  IVideoRepository,
  UploadVideoDTO,
  UploadProgressCallback,
  VideoItem,
  FeedParams,
  FeedResponse,
  CommentItem,
} from '../types';

export const videoRepository: IVideoRepository = {
  /**
   * Quy trình upload 2 bước an toàn:
   * Bước 1: Tải lên video + thumbnail bìa lên storage, nhận url tương đối.
   * Bước 2: Tạo bản ghi metadata Video trong database.
   */
  async uploadAndCreateVideo(
    dto: UploadVideoDTO,
    onProgress?: UploadProgressCallback,
    cancelSignal?: AbortSignal,
  ): Promise<VideoItem> {
    try {
      // 1. Upload files
      const uploadRes = await videoService.uploadFiles(
        dto.videoUri,
        dto.thumbnailUri,
        onProgress,
        cancelSignal,
      );

      if (!uploadRes?.videoUrl) {
        throw new Error('Không nhận được đường dẫn video từ máy chủ');
      }

      // 2. Tạo bài đăng video
      const createdVideo = await videoService.createVideoPost({
        videoUrl: uploadRes.videoUrl,
        thumbnailUrl: uploadRes.thumbnailUrl || undefined,
        caption: dto.caption,
        musicTitle: dto.musicTitle,
        location: dto.location,
        serviceId: dto.serviceId,
        duration: dto.duration,
        width: dto.width,
        height: dto.height,
        sizeBytes: dto.sizeBytes || uploadRes.sizeBytes,
        mimeType: dto.mimeType || uploadRes.mimeType,
        hashtags: dto.hashtags,
      });

      return createdVideo;
    } catch (error: any) {
      console.error('[VideoRepository] Upload or create post failed:', error);
      throw error;
    }
  },

  async getVideo(id: string): Promise<VideoItem> {
    return videoService.getVideoById(id);
  },

  async getFeed(params?: FeedParams): Promise<FeedResponse> {
    return videoService.getFeed(params);
  },

  async likeVideo(videoId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }> {
    return videoService.likeVideo(videoId);
  },

  async unlikeVideo(videoId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }> {
    return videoService.unlikeVideo(videoId);
  },

  async toggleSaveVideo(videoId: string): Promise<{ success: boolean; isSaved: boolean; savesCount: number }> {
    return videoService.toggleSaveVideo(videoId);
  },

  async getVideoComments(videoId: string): Promise<CommentItem[]> {
    return videoService.getVideoComments(videoId);
  },

  async createVideoComment(videoId: string, content: string, parentId?: string): Promise<CommentItem> {
    return videoService.createVideoComment(videoId, content, parentId);
  },

  async recordView(videoId: string, watchDuration?: number): Promise<{ success: boolean; viewsCount: number }> {
    return videoService.recordView(videoId, watchDuration);
  },

  async followUser(userId: string): Promise<{ success: boolean; isFollowing: boolean }> {
    return videoService.followUser(userId);
  },

  async unfollowUser(userId: string): Promise<{ success: boolean; isFollowing: boolean }> {
    return videoService.unfollowUser(userId);
  },

  async likeComment(videoId: string, commentId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }> {
    return videoService.likeComment(videoId, commentId);
  },

  async unlikeComment(videoId: string, commentId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }> {
    return videoService.unlikeComment(videoId, commentId);
  },

  async deleteComment(videoId: string, commentId: string): Promise<{ success: boolean; message: string }> {
    return videoService.deleteComment(videoId, commentId);
  },
};
