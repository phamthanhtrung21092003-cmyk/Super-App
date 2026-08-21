import { Image, Platform } from 'react-native';

export interface ImageHolderData {
  uri: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
}

let heldImage: ImageHolderData | null = null;

export const imageHolderService = {
  /**
   * Stores the selected image data in memory.
   */
  setImage(data: ImageHolderData): void {
    heldImage = { ...data };
  },

  /**
   * Retrieves the currently held image data.
   */
  getImage(): ImageHolderData | null {
    return heldImage;
  },

  /**
   * Clears the held image data from memory.
   */
  clearImage(): void {
    heldImage = null;
  },

  /**
   * Asynchronously retrieves the true width and height of an image given its URI.
   * Works on Web, Android, and iOS.
   */
  async getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
    if (!uri) {
      return { width: 0, height: 0 };
    }

    // On Web, HTML Image element is fast and accurate for data: / blob: / http:
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof Image !== 'undefined') {
      try {
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
            resolve({
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height,
            });
          };
          img.onerror = (err) => {
            reject(err);
          };
          img.src = uri;
        });

        if (dimensions.width > 0 && dimensions.height > 0) {
          return dimensions;
        }
      } catch (webErr) {
        console.warn('[imageHolderService] Web image dimension calculation fallback:', webErr);
      }
    }

    // React Native Image.getSize for Native & fallback
    return new Promise((resolve) => {
      Image.getSize(
        uri,
        (width, height) => {
          resolve({ width, height });
        },
        (error) => {
          console.warn('[imageHolderService] Image.getSize failed:', error);
          resolve({ width: 0, height: 0 });
        }
      );
    });
  },
};

export default imageHolderService;
