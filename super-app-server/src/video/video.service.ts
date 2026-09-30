import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../upload/storage.service';
import { NotificationService } from '../notification/notification.service';
import { CreateVideoDto, FeedQueryDto, CreateCommentDto } from './dto';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly notificationService: NotificationService,
  ) {}


  /**
   * Tạo video mới kèm VideoMedia và VideoProcessing
   */
  async createVideo(userId: string, dto: CreateVideoDto) {
    // Kiểm tra user tồn tại
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, username: true, avatarUrl: true },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    // Nếu có gắn kèm serviceId, kiểm tra tính hợp lệ
    if (dto.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });
      if (!service) {
        throw new BadRequestException('Dịch vụ liên kết không tồn tại');
      }
    }

    // Trích xuất hashtag từ caption và gộp với dto.hashtags
    const extractedTags = this.extractHashtags(dto.caption, dto.hashtags);

    // Tạo bản ghi Video
    const video = await this.prisma.video.create({
      data: {
        userId,
        caption: dto.caption || null,
        musicTitle: dto.musicTitle || 'Âm thanh gốc',
        location: dto.location || null,
        serviceId: dto.serviceId || null,
        status: 'PUBLISHED',
        media: {
          create: {
            url: dto.videoUrl,
            thumbnailUrl: dto.thumbnailUrl || null,
            duration: dto.duration || null,
            width: dto.width || null,
            height: dto.height || null,
            sizeBytes: dto.sizeBytes ? BigInt(Math.round(dto.sizeBytes)) : null,
            mimeType: dto.mimeType || 'video/mp4',
            storageProvider: 'LOCAL',
            isOriginal: true,
          },
        },
        processing: {
          create: {
            status: 'COMPLETED',
            progress: 100,
          },
        },
      },
      include: {
        media: true,
        processing: true,
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            type: true,
            basePrice: true,
          },
        },
      },
    });

    // Xử lý liên kết hashtag
    if (extractedTags.length > 0) {
      for (const tag of extractedTags) {
        try {
          const hashtag = await this.prisma.hashtag.upsert({
            where: { name: tag },
            update: { usageCount: { increment: 1 } },
            create: { name: tag, usageCount: 1 },
          });

          await this.prisma.videoHashtag.upsert({
            where: {
              videoId_hashtagId: {
                videoId: video.id,
                hashtagId: hashtag.id,
              },
            },
            update: {},
            create: {
              videoId: video.id,
              hashtagId: hashtag.id,
            },
          });
        } catch (err) {
          this.logger.warn(`Lỗi khi liên kết hashtag #${tag}:`, err);
        }
      }
    }

    const savedHashtags = extractedTags.map((name) => ({ hashtag: { name } }));
    return this.serializeVideo({
      ...video,
      hashtags: savedHashtags,
    });
  }

  /**
   * Lấy chi tiết một video theo ID (kèm trạng thái tương tác nếu đã đăng nhập)
   */
  async getVideoById(videoId: string, userId?: string | null) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        media: true,
        processing: true,
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            type: true,
            basePrice: true,
          },
        },
        hashtags: {
          include: {
            hashtag: true,
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Không tìm thấy video');
    }

    let isLiked = false;
    let isSaved = false;
    let isFollowing = false;

    if (userId) {
      const [like, save, follow] = await Promise.all([
        this.prisma.videoLike.findUnique({
          where: { userId_videoId: { userId, videoId } },
          select: { id: true },
        }),
        this.prisma.videoSave.findUnique({
          where: { userId_videoId: { userId, videoId } },
          select: { id: true },
        }),
        this.prisma.follow.findUnique({
          where: {
            followerId_followingId: { followerId: userId, followingId: video.userId },
          },
          select: { id: true },
        }),
      ]);
      isLiked = !!like;
      isSaved = !!save;
      isFollowing = !!follow;
    }

    const serialized = this.serializeVideo(video);
    return {
      ...serialized,
      isLiked,
      isSaved,
      isFollowing,
    };
  }

  /**
   * Lấy danh sách video feed (TikTok-like Cursor Pagination)
   */
  async getFeed(userId: string | null, query: FeedQueryDto) {
    const limit = query.limit ? Number(query.limit) : 10;
    const tab = query.tab || 'foryou';
    const cursor = query.cursor;

    const whereClause: any = {
      status: 'PUBLISHED',
    };

    if (tab === 'following') {
      if (!userId) {
        return {
          items: [],
          nextCursor: null,
          hasMore: false,
        };
      }

      const follows = await this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      const followingUserIds = follows.map((f) => f.followingId);
      if (followingUserIds.length === 0) {
        return {
          items: [],
          nextCursor: null,
          hasMore: false,
        };
      }

      whereClause.userId = { in: followingUserIds };
    }

    const queryOptions: any = {
      where: whereClause,
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        media: true,
        processing: true,
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            type: true,
            basePrice: true,
          },
        },
        hashtags: {
          include: {
            hashtag: true,
          },
        },
      },
    };

    let rawVideos: any[] = [];
    if (cursor) {
      try {
        queryOptions.cursor = { id: cursor };
        queryOptions.skip = 1;
        rawVideos = await this.prisma.video.findMany(queryOptions);
      } catch (err: any) {
        this.logger.warn(`Cursor feed "${cursor}" không hợp lệ hoặc đã bị xóa. Tự động nạp từ đầu.`);
        delete queryOptions.cursor;
        delete queryOptions.skip;
        rawVideos = await this.prisma.video.findMany(queryOptions);
      }
    } else {
      rawVideos = await this.prisma.video.findMany(queryOptions);
    }

    const hasMore = rawVideos.length > limit;
    const pagedVideos = hasMore ? rawVideos.slice(0, limit) : rawVideos;
    const nextCursor = hasMore && pagedVideos.length > 0 ? pagedVideos[pagedVideos.length - 1].id : null;

    // Eager load tương tác người dùng nếu đã đăng nhập
    let likedVideoIds = new Set<string>();
    let savedVideoIds = new Set<string>();
    let followingCreatorIds = new Set<string>();

    if (userId && pagedVideos.length > 0) {
      const videoIds = pagedVideos.map((v) => v.id);
      const creatorIds = Array.from(new Set(pagedVideos.map((v) => v.userId)));

      const [likes, saves, follows] = await Promise.all([
        this.prisma.videoLike.findMany({
          where: {
            userId,
            videoId: { in: videoIds },
          },
          select: { videoId: true },
        }),
        this.prisma.videoSave.findMany({
          where: {
            userId,
            videoId: { in: videoIds },
          },
          select: { videoId: true },
        }),
        this.prisma.follow.findMany({
          where: {
            followerId: userId,
            followingId: { in: creatorIds },
          },
          select: { followingId: true },
        }),
      ]);

      likedVideoIds = new Set(likes.map((l) => l.videoId));
      savedVideoIds = new Set(saves.map((s) => s.videoId));
      followingCreatorIds = new Set(follows.map((f) => f.followingId));
    }

    const items = pagedVideos.map((video) => {
      const serialized = this.serializeVideo(video);
      return {
        ...serialized,
        isLiked: likedVideoIds.has(video.id),
        isSaved: savedVideoIds.has(video.id),
        isFollowing: followingCreatorIds.has(video.userId),
      };
    });

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Lấy trạng thái xử lý video (VideoProcessing)
   */
  async getVideoProcessing(videoId: string) {
    const processing = await this.prisma.videoProcessing.findUnique({
      where: { videoId },
    });

    if (!processing) {
      return {
        status: 'COMPLETED',
        progress: 100,
        errorMessage: null,
      };
    }

    return {
      status: processing.status,
      progress: processing.progress,
      errorMessage: processing.errorMessage,
    };
  }

  /**
   * Thả tim (Like) video (Idempotent với @@unique([userId, videoId]))
   */
  async likeVideo(userId: string, videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, userId: true, likesCount: true },
    });

    if (!video) {
      throw new NotFoundException('Không tìm thấy video');
    }

    const existing = await this.prisma.videoLike.findUnique({
      where: {
        userId_videoId: { userId, videoId },
      },
    });

    if (existing) {
      return {
        success: true,
        isLiked: true,
        likesCount: video.likesCount,
      };
    }

    try {
      const [, updatedVideo] = await this.prisma.$transaction([
        this.prisma.videoLike.create({
          data: { userId, videoId },
        }),
        this.prisma.video.update({
          where: { id: videoId },
          data: { likesCount: { increment: 1 } },
          select: { likesCount: true },
        }),
      ]);

      // Gửi thông báo đến chủ video nếu không phải tự like video của chính mình
      if (video.userId !== userId) {
        try {
          const liker = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fullName: true, username: true },
          });
          const likerName = liker?.fullName || liker?.username || 'Một người dùng';
          await this.notificationService.createNotification({
            recipientId: video.userId,
            recipientType: 'USER',
            title: 'Lượt thích mới ❤️',
            body: `${likerName} đã thích video của bạn`,
            data: { videoId, type: 'VIDEO_LIKE' },
            eventKey: `video_like_${userId}_${videoId}`,
          });
        } catch (err: any) {
          this.logger.warn(`Failed to send like notification: ${err?.message}`);
        }
      }

      return {
        success: true,
        isLiked: true,
        likesCount: updatedVideo.likesCount,
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        const fresh = await this.prisma.video.findUnique({
          where: { id: videoId },
          select: { likesCount: true },
        });
        return {
          success: true,
          isLiked: true,
          likesCount: fresh?.likesCount ?? video.likesCount,
        };
      }
      throw err;
    }
  }

  /**
   * Hủy thả tim (Unlike) video
   */
  async unlikeVideo(userId: string, videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, likesCount: true },
    });

    if (!video) {
      throw new NotFoundException('Không tìm thấy video');
    }

    const existing = await this.prisma.videoLike.findUnique({
      where: {
        userId_videoId: { userId, videoId },
      },
    });

    if (!existing) {
      return {
        success: true,
        isLiked: false,
        likesCount: Math.max(0, video.likesCount),
      };
    }

    try {
      const [, updatedVideo] = await this.prisma.$transaction([
        this.prisma.videoLike.delete({
          where: { id: existing.id },
        }),
        this.prisma.video.update({
          where: { id: videoId },
          data: {
            likesCount: {
              decrement: video.likesCount > 0 ? 1 : 0,
            },
          },
          select: { likesCount: true },
        }),
      ]);

      return {
        success: true,
        isLiked: false,
        likesCount: Math.max(0, updatedVideo.likesCount),
      };
    } catch (err: any) {
      if (err?.code === 'P2025') {
        const fresh = await this.prisma.video.findUnique({
          where: { id: videoId },
          select: { likesCount: true },
        });
        return {
          success: true,
          isLiked: false,
          likesCount: fresh ? Math.max(0, fresh.likesCount) : Math.max(0, video.likesCount),
        };
      }
      throw err;
    }
  }

  /**
   * Lấy danh sách bình luận của video (kèm câu trả lời reply)
   */
  async getComments(videoId: string, userId?: string | null) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true },
    });

    if (!video) {
      throw new NotFoundException('Không tìm thấy video');
    }

    const comments = await this.prisma.videoComment.findMany({
      where: {
        videoId,
        parentId: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
          },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    let likedCommentIds = new Set<string>();
    if (userId && comments.length > 0) {
      const allCommentIds: string[] = [];
      comments.forEach((c) => {
        allCommentIds.push(c.id);
        if (c.replies) {
          c.replies.forEach((r) => allCommentIds.push(r.id));
        }
      });

      const userLikes = await this.prisma.videoCommentLike.findMany({
        where: {
          userId,
          commentId: { in: allCommentIds },
        },
        select: { commentId: true },
      });
      likedCommentIds = new Set(userLikes.map((ul) => ul.commentId));
    }

    const formattedComments = comments.map((c) => ({
      id: c.id,
      videoId: c.videoId,
      userId: c.userId,
      user: c.user,
      content: c.content,
      likesCount: c.likesCount,
      isLiked: likedCommentIds.has(c.id),
      createdAt: c.createdAt.toISOString(),
      replies: c.replies.map((r) => ({
        id: r.id,
        videoId: r.videoId,
        userId: r.userId,
        user: r.user,
        content: r.content,
        likesCount: r.likesCount,
        isLiked: likedCommentIds.has(r.id),
        createdAt: r.createdAt.toISOString(),
        parentId: r.parentId,
      })),
    }));

    return formattedComments;
  }

  /**
   * Tạo bình luận mới cho video (hỗ trợ parentId trả lời bình luận)
   */
  async createComment(userId: string, videoId: string, dto: CreateCommentDto) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, userId: true },
    });

    if (!video) {
      throw new NotFoundException('Không tìm thấy video');
    }

    let parentComment: any = null;
    let actualParentId = dto.parentId || null;
    if (dto.parentId) {
      parentComment = await this.prisma.videoComment.findUnique({
        where: { id: dto.parentId },
        select: { id: true, videoId: true, userId: true, parentId: true },
      });

      if (!parentComment || parentComment.videoId !== videoId) {
        throw new BadRequestException('Bình luận cha không tồn tại hoặc không thuộc video này');
      }

      // Nếu bình luận cha vốn là một reply, gắn trực tiếp vào bình luận gốc để giữ cấu trúc phẳng 2 cấp chuẩn TikTok
      if (parentComment.parentId) {
        actualParentId = parentComment.parentId;
      }
    }

    const [comment] = await this.prisma.$transaction([
      this.prisma.videoComment.create({
        data: {
          videoId,
          userId,
          parentId: actualParentId,
          content: dto.content.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.video.update({
        where: { id: videoId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    // Gửi thông báo
    try {
      const commenter = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, username: true },
      });
      const commenterName = commenter?.fullName || commenter?.username || 'Một người dùng';
      const snippet = dto.content.length > 50 ? `${dto.content.slice(0, 47)}...` : dto.content;

      if (dto.parentId && parentComment && parentComment.userId !== userId) {
        await this.notificationService.createNotification({
          recipientId: parentComment.userId,
          recipientType: 'USER',
          title: 'Phản hồi bình luận 💬',
          body: `${commenterName} đã trả lời bình luận của bạn: "${snippet}"`,
          data: { videoId, commentId: comment.id, type: 'COMMENT_REPLY' },
          eventKey: `video_comment_reply_${comment.id}`,
        });
      } else if (!dto.parentId && video.userId !== userId) {
        await this.notificationService.createNotification({
          recipientId: video.userId,
          recipientType: 'USER',
          title: 'Bình luận mới 💬',
          body: `${commenterName} đã bình luận về video của bạn: "${snippet}"`,
          data: { videoId, commentId: comment.id, type: 'NEW_COMMENT' },
          eventKey: `video_comment_new_${comment.id}`,
        });
      }
    } catch (err: any) {
      this.logger.warn(`Failed to send comment notification: ${err?.message}`);
    }

    return {
      id: comment.id,
      videoId: comment.videoId,
      userId: comment.userId,
      user: comment.user,
      content: comment.content,
      likesCount: comment.likesCount,
      isLiked: false,
      createdAt: comment.createdAt.toISOString(),
      parentId: comment.parentId,
    };
  }

  /**
   * Lưu / Bỏ lưu video (Toggle VideoSave)
   */
  async saveVideo(userId: string, videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, savesCount: true },
    });

    if (!video) {
      throw new NotFoundException('Không tìm thấy video');
    }

    const existing = await this.prisma.videoSave.findUnique({
      where: {
        userId_videoId: { userId, videoId },
      },
    });

    if (existing) {
      try {
        const [, updatedVideo] = await this.prisma.$transaction([
          this.prisma.videoSave.delete({
            where: { id: existing.id },
          }),
          this.prisma.video.update({
            where: { id: videoId },
            data: {
              savesCount: {
                decrement: video.savesCount > 0 ? 1 : 0,
              },
            },
            select: { savesCount: true },
          }),
        ]);

        return {
          success: true,
          isSaved: false,
          savesCount: Math.max(0, updatedVideo.savesCount),
        };
      } catch (err: any) {
        if (err?.code === 'P2025') {
          const fresh = await this.prisma.video.findUnique({
            where: { id: videoId },
            select: { savesCount: true },
          });
          return {
            success: true,
            isSaved: false,
            savesCount: fresh ? Math.max(0, fresh.savesCount) : Math.max(0, video.savesCount),
          };
        }
        throw err;
      }
    } else {
      try {
        const [, updatedVideo] = await this.prisma.$transaction([
          this.prisma.videoSave.create({
            data: { userId, videoId },
          }),
          this.prisma.video.update({
            where: { id: videoId },
            data: { savesCount: { increment: 1 } },
            select: { savesCount: true },
          }),
        ]);

        return {
          success: true,
          isSaved: true,
          savesCount: updatedVideo.savesCount,
        };
      } catch (err: any) {
        if (err?.code === 'P2002') {
          return {
            success: true,
            isSaved: true,
            savesCount: video.savesCount,
          };
        }
        throw err;
      }
    }
  }

  /**
   * Ghi nhận lượt xem video (VideoView) với Debounce 30 giây
   */
  async recordView(
    userId: string | null,
    videoId: string,
    ipAddress?: string,
    watchDuration?: number,
  ) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, viewsCount: true },
    });

    if (!video) {
      throw new NotFoundException('Không tìm thấy video');
    }

    // Debounce: Nếu cùng user (hoặc ipAddress) đã xem video này trong vòng 30s thì bỏ qua
    const identityFilter = userId ? { userId } : ipAddress ? { ipAddress } : null;
    if (identityFilter) {
      const recentCutoff = new Date(Date.now() - 30 * 1000);
      const recentView = await this.prisma.videoView.findFirst({
        where: {
          videoId,
          createdAt: { gte: recentCutoff },
          ...identityFilter,
        },
        select: { id: true },
      });

      if (recentView) {
        return {
          success: true,
          viewsCount: video.viewsCount,
          debounced: true,
        };
      }
    }

    const [, updatedVideo] = await this.prisma.$transaction([
      this.prisma.videoView.create({
        data: {
          videoId,
          userId: userId || null,
          ipAddress: ipAddress || null,
          watchDuration: watchDuration || null,
        },
      }),
      this.prisma.video.update({
        where: { id: videoId },
        data: { viewsCount: { increment: 1 } },
        select: { viewsCount: true },
      }),
    ]);

    return {
      success: true,
      viewsCount: updatedVideo.viewsCount,
    };
  }

  /**
   * Trích xuất và chuẩn hóa hashtags từ caption và mảng input
   */
  private extractHashtags(caption?: string, inputTags?: string[]): string[] {
    const tagSet = new Set<string>();

    if (inputTags && Array.isArray(inputTags)) {
      for (const t of inputTags) {
        const clean = t.replace(/^#+/, '').trim().toLowerCase();
        if (clean.length > 0) tagSet.add(clean);
      }
    }

    if (caption) {
      const matches = caption.match(/#([\p{L}\p{N}_]+)/gu);
      if (matches) {
        for (const m of matches) {
          const clean = m.replace(/^#+/, '').trim().toLowerCase();
          if (clean.length > 0) tagSet.add(clean);
        }
      }
    }

    return Array.from(tagSet);
  }

  /**
   * Thích (Like) bình luận
   */
  async likeComment(userId: string, videoId: string, commentId: string) {
    const comment = await this.prisma.videoComment.findUnique({
      where: { id: commentId },
      select: { id: true, videoId: true, userId: true, likesCount: true },
    });

    if (!comment || comment.videoId !== videoId) {
      throw new NotFoundException('Không tìm thấy bình luận');
    }

    const existing = await this.prisma.videoCommentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });

    if (existing) {
      return {
        success: true,
        isLiked: true,
        likesCount: comment.likesCount,
      };
    }

    try {
      const [, updatedComment] = await this.prisma.$transaction([
        this.prisma.videoCommentLike.create({
          data: { userId, commentId },
        }),
        this.prisma.videoComment.update({
          where: { id: commentId },
          data: { likesCount: { increment: 1 } },
          select: { likesCount: true },
        }),
      ]);

      if (comment.userId !== userId) {
        try {
          const liker = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fullName: true, username: true },
          });
          const likerName = liker?.fullName || liker?.username || 'Một người dùng';
          await this.notificationService.createNotification({
            recipientId: comment.userId,
            recipientType: 'USER',
            title: 'Lượt thích bình luận ❤️',
            body: `${likerName} đã thích bình luận của bạn`,
            data: { videoId, commentId, type: 'COMMENT_LIKE' },
            eventKey: `video_comment_like_${userId}_${commentId}`,
          });
        } catch (err: any) {
          this.logger.warn(`Failed to send comment like notification: ${err?.message}`);
        }
      }

      return {
        success: true,
        isLiked: true,
        likesCount: updatedComment.likesCount,
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        const fresh = await this.prisma.videoComment.findUnique({
          where: { id: commentId },
          select: { likesCount: true },
        });
        return {
          success: true,
          isLiked: true,
          likesCount: fresh?.likesCount ?? comment.likesCount,
        };
      }
      throw err;
    }
  }

  /**
   * Bỏ thích (Unlike) bình luận
   */
  async unlikeComment(userId: string, videoId: string, commentId: string) {
    const comment = await this.prisma.videoComment.findUnique({
      where: { id: commentId },
      select: { id: true, videoId: true, likesCount: true },
    });

    if (!comment || comment.videoId !== videoId) {
      throw new NotFoundException('Không tìm thấy bình luận');
    }

    const existing = await this.prisma.videoCommentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });

    if (!existing) {
      return {
        success: true,
        isLiked: false,
        likesCount: Math.max(0, comment.likesCount),
      };
    }

    try {
      const [, updatedComment] = await this.prisma.$transaction([
        this.prisma.videoCommentLike.delete({
          where: { id: existing.id },
        }),
        this.prisma.videoComment.update({
          where: { id: commentId },
          data: {
            likesCount: {
              decrement: comment.likesCount > 0 ? 1 : 0,
            },
          },
          select: { likesCount: true },
        }),
      ]);

      return {
        success: true,
        isLiked: false,
        likesCount: Math.max(0, updatedComment.likesCount),
      };
    } catch (err: any) {
      if (err?.code === 'P2025') {
        const fresh = await this.prisma.videoComment.findUnique({
          where: { id: commentId },
          select: { likesCount: true },
        });
        return {
          success: true,
          isLiked: false,
          likesCount: fresh ? Math.max(0, fresh.likesCount) : Math.max(0, comment.likesCount),
        };
      }
      throw err;
    }
  }

  /**
   * Xóa bình luận (người viết bình luận hoặc chủ video có quyền kiểm duyệt)
   */
  async deleteComment(userId: string, videoId: string, commentId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, userId: true, commentsCount: true },
    });

    if (!video) {
      throw new NotFoundException('Không tìm thấy video');
    }

    const comment = await this.prisma.videoComment.findUnique({
      where: { id: commentId },
      select: { id: true, videoId: true, userId: true },
    });

    if (!comment || comment.videoId !== videoId) {
      throw new NotFoundException('Không tìm thấy bình luận');
    }

    if (comment.userId !== userId && video.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền xóa bình luận này');
    }

    // Đếm số lượng replies sẽ bị cascade delete cùng bình luận này để giảm đúng commentsCount
    const repliesCount = await this.prisma.videoComment.count({
      where: { parentId: commentId },
    });
    const totalDeleted = 1 + repliesCount;
    const decrementAmount = Math.min(video.commentsCount, totalDeleted);

    await this.prisma.$transaction([
      this.prisma.videoComment.delete({
        where: { id: commentId },
      }),
      this.prisma.video.update({
        where: { id: videoId },
        data: {
          commentsCount: {
            decrement: decrementAmount,
          },
        },
      }),
    ]);

    return {
      success: true,
      message: 'Đã xóa bình luận thành công',
      deletedCount: totalDeleted,
    };
  }

  /**
   * Chuyển đổi dữ liệu Prisma (bao gồm BigInt, Decimal) sang định dạng an toàn với JSON
   */
  private serializeVideo(video: any) {
    if (!video) return null;
    return {
      ...video,
      service: video.service
        ? {
            ...video.service,
            basePrice: video.service.basePrice != null ? Number(video.service.basePrice) : undefined,
          }
        : video.service,
      media: video.media?.map((m: any) => ({
        ...m,
        sizeBytes: m.sizeBytes != null ? Number(m.sizeBytes) : null,
      })),
      hashtags: video.hashtags?.map((vh: any) => vh.hashtag?.name || vh.name) || [],
    };
  }
}

