export type VideoStatus = 'DRAFT' | 'PROCESSING' | 'PUBLISHED' | 'BLOCKED' | 'DELETED';

export interface VideoMedia {
  id: string;
  videoId: string;
  url: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
  mimeType?: string | null;
  storageProvider?: string;
  isOriginal?: boolean;
  createdAt?: string;
}

export interface VideoCreator {
  id: string;
  fullName?: string;
  username?: string;
  avatarUrl?: string | null;
}

export interface VideoItem {
  id: string;
  userId: string;
  user: VideoCreator;
  caption?: string | null;
  musicTitle?: string | null;
  location?: string | null;
  status: VideoStatus;
  serviceId?: string | null;
  service?: {
    id: string;
    title: string;
    type: string;
    basePrice?: number;
  } | null;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  media: VideoMedia[];
  hashtags?: string[];
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedParams {
  cursor?: string;
  limit?: number;
  tab?: 'foryou' | 'following';
}

export interface FeedResponse {
  items: VideoItem[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface CommentUser {
  id: string;
  fullName?: string;
  username?: string;
  avatarUrl?: string | null;
}

export interface CommentItem {
  id: string;
  videoId: string;
  userId: string;
  user: CommentUser;
  content: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  parentId?: string | null;
  replies?: CommentItem[];
}

export interface UploadVideoDTO {
  videoUri: string;
  thumbnailUri?: string;
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
}

export type UploadProgressCallback = (
  progressPercent: number,
  loadedBytes: number,
  totalBytes: number,
) => void;

export interface UploadResult {
  videoUrl: string;
  thumbnailUrl?: string | null;
  sizeBytes: number;
  mimeType: string;
  originalname: string;
}

export interface IVideoService {
  uploadFiles(
    videoUri: string,
    thumbnailUri?: string,
    onProgress?: UploadProgressCallback,
    cancelSignal?: AbortSignal,
  ): Promise<UploadResult>;
  createVideoPost(dto: {
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
  }): Promise<VideoItem>;
  getVideoById(id: string): Promise<VideoItem>;
  getFeed(params?: FeedParams): Promise<FeedResponse>;
  likeVideo(videoId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }>;
  unlikeVideo(videoId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }>;
  toggleSaveVideo(videoId: string): Promise<{ success: boolean; isSaved: boolean; savesCount: number }>;
  getVideoComments(videoId: string): Promise<CommentItem[]>;
  createVideoComment(videoId: string, content: string, parentId?: string): Promise<CommentItem>;
  recordView(videoId: string, watchDuration?: number): Promise<{ success: boolean; viewsCount: number }>;
  followUser(userId: string): Promise<{ success: boolean; isFollowing: boolean }>;
  unfollowUser(userId: string): Promise<{ success: boolean; isFollowing: boolean }>;
  likeComment(videoId: string, commentId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }>;
  unlikeComment(videoId: string, commentId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }>;
  deleteComment(videoId: string, commentId: string): Promise<{ success: boolean; message: string }>;
}

export interface IVideoRepository {
  uploadAndCreateVideo(
    dto: UploadVideoDTO,
    onProgress?: UploadProgressCallback,
    cancelSignal?: AbortSignal,
  ): Promise<VideoItem>;
  getVideo(id: string): Promise<VideoItem>;
  getFeed(params?: FeedParams): Promise<FeedResponse>;
  likeVideo(videoId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }>;
  unlikeVideo(videoId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }>;
  toggleSaveVideo(videoId: string): Promise<{ success: boolean; isSaved: boolean; savesCount: number }>;
  getVideoComments(videoId: string): Promise<CommentItem[]>;
  createVideoComment(videoId: string, content: string, parentId?: string): Promise<CommentItem>;
  recordView(videoId: string, watchDuration?: number): Promise<{ success: boolean; viewsCount: number }>;
  followUser(userId: string): Promise<{ success: boolean; isFollowing: boolean }>;
  unfollowUser(userId: string): Promise<{ success: boolean; isFollowing: boolean }>;
  likeComment(videoId: string, commentId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }>;
  unlikeComment(videoId: string, commentId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }>;
  deleteComment(videoId: string, commentId: string): Promise<{ success: boolean; message: string }>;
}
