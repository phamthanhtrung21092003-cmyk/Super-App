import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedMediaResult {
  videoUrl: string;
  thumbnailUrl?: string;
  videoFilename: string;
  thumbnailFilename?: string;
  videoSize: number;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);

  private readonly uploadsRoot = path.join(process.cwd(), 'uploads');
  private readonly videosDir = path.join(process.cwd(), 'uploads', 'videos');
  private readonly thumbnailsDir = path.join(process.cwd(), 'uploads', 'thumbnails');
  private readonly avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');

  onModuleInit() {
    this.ensureDirectoriesExist();
  }

  /**
   * Đảm bảo các thư mục lưu trữ video, thumbnail và avatar luôn tồn tại
   */
  ensureDirectoriesExist(): void {
    const dirs = [this.uploadsRoot, this.videosDir, this.thumbnailsDir, this.avatarsDir];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`Created storage directory: ${dir}`);
      }
    }
  }

  getVideosDirectory(): string {
    return this.videosDir;
  }

  getThumbnailsDirectory(): string {
    return this.thumbnailsDir;
  }

  getVideoRelativeUrl(filename: string): string {
    return `/uploads/videos/${filename}`;
  }

  getThumbnailRelativeUrl(filename: string): string {
    return `/uploads/thumbnails/${filename}`;
  }

  deleteFile(relativeOrAbsolutePath: string): boolean {
    try {
      let fullPath = relativeOrAbsolutePath;
      if (relativeOrAbsolutePath.startsWith('/uploads/')) {
        fullPath = path.join(process.cwd(), relativeOrAbsolutePath.slice(1));
      } else if (!path.isAbsolute(fullPath)) {
        fullPath = path.join(this.uploadsRoot, relativeOrAbsolutePath);
      }

      // Bảo vệ chống path traversal: File phải nằm bên trong uploadsRoot
      const normalizedPath = path.resolve(fullPath);
      const normalizedUploadsRoot = path.resolve(this.uploadsRoot);
      if (!normalizedPath.startsWith(normalizedUploadsRoot)) {
        this.logger.warn(`Security check: Chặn xóa file ngoài thư mục uploads: ${normalizedPath}`);
        return false;
      }

      if (fs.existsSync(normalizedPath)) {
        fs.unlinkSync(normalizedPath);
        return true;
      }
      return false;
    } catch (err) {
      this.logger.error(`Failed to delete file: ${relativeOrAbsolutePath}`, err);
      return false;
    }
  }
}
