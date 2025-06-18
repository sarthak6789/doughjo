import { supabase } from './supabase';

export interface ImageUploadOptions {
  bucket: 'learn-images' | 'learn-thumbnails' | 'avatars';
  folder?: string;
  fileName?: string;
  quality?: number;
}

export interface ImageMetadata {
  url: string;
  path: string;
  size: number;
  mimeType: string;
  altText?: string;
}

class ImageService {
  private readonly FALLBACK_IMAGES = {
    lesson: 'https://images.pexels.com/photos/4386342/pexels-photo-4386342.jpeg',
    category: 'https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg',
    quiz: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg',
    profile: 'https://images.pexels.com/photos/4386437/pexels-photo-4386437.jpeg',
  };

  /**
   * Get a public URL for an image from Supabase storage
   */
  getImageUrl(bucket: string, path: string): string {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return this.FALLBACK_IMAGES.lesson;
    }
  }

  /**
   * Upload an image to Supabase storage
   */
  async uploadImage(
    file: File | Blob, 
    options: ImageUploadOptions
  ): Promise<ImageMetadata | null> {
    try {
      const { bucket, folder = '', fileName, quality = 0.8 } = options;
      
      // Generate unique filename if not provided
      const timestamp = Date.now();
      const fileExt = this.getFileExtension(file);
      const finalFileName = fileName || `image_${timestamp}.${fileExt}`;
      const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const publicUrl = this.getImageUrl(bucket, data.path);

      return {
        url: publicUrl,
        path: data.path,
        size: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  /**
   * Delete an image from Supabase storage
   */
  async deleteImage(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedImageUrl(
    bucket: string, 
    path: string, 
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): string {
    try {
      const baseUrl = this.getImageUrl(bucket, path);
      
      // For now, return the base URL
      // In the future, you can implement image transformations
      // using Supabase's image transformation features or a CDN
      return baseUrl;
    } catch (error) {
      console.error('Error getting optimized image URL:', error);
      return this.getFallbackImage('lesson');
    }
  }

  /**
   * Get fallback image for different content types
   */
  getFallbackImage(type: keyof typeof this.FALLBACK_IMAGES): string {
    return this.FALLBACK_IMAGES[type] || this.FALLBACK_IMAGES.lesson;
  }

  /**
   * Preload images for better performance
   */
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    });

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }

  /**
   * Validate image file
   */
  validateImage(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size too large. Please upload images smaller than 10MB.'
      };
    }

    return { isValid: true };
  }

  /**
   * Get file extension from file or blob
   */
  private getFileExtension(file: File | Blob): string {
    if (file instanceof File) {
      return file.name.split('.').pop()?.toLowerCase() || 'jpg';
    }
    
    // For blobs, determine extension from MIME type
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };
    
    return mimeToExt[file.type] || 'jpg';
  }

  /**
   * Generate thumbnail from image
   */
  async generateThumbnail(
    imageFile: File, 
    maxWidth: number = 300, 
    maxHeight: number = 300,
    quality: number = 0.8
  ): Promise<Blob | null> {
    try {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(resolve, 'image/jpeg', quality);
        };

        img.src = URL.createObjectURL(imageFile);
      });
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }
}

export const imageService = new ImageService();