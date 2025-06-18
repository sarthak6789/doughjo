import { useState, useEffect, useCallback } from 'react';
import { imageService } from '@/lib/imageService';

interface ImageLoadState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  url: string | null;
}

interface UseImageLoaderOptions {
  fallbackType?: 'lesson' | 'category' | 'quiz' | 'profile';
  preload?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export function useImageLoader(
  imageUrl: string | null | undefined,
  options: UseImageLoaderOptions = {}
) {
  const {
    fallbackType = 'lesson',
    preload = false,
    retryCount = 2,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<ImageLoadState>({
    isLoading: false,
    isLoaded: false,
    hasError: false,
    url: null
  });

  const [retryAttempts, setRetryAttempts] = useState(0);

  const loadImage = useCallback(async (url: string, attempt: number = 0) => {
    setState(prev => ({ ...prev, isLoading: true, hasError: false }));

    try {
      // For web, we can preload the image
      if (preload && typeof window !== 'undefined') {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = url;
        });
      }

      setState({
        isLoading: false,
        isLoaded: true,
        hasError: false,
        url
      });
    } catch (error) {
      console.warn(`Failed to load image (attempt ${attempt + 1}):`, url, error);

      if (attempt < retryCount) {
        setTimeout(() => {
          setRetryAttempts(attempt + 1);
          loadImage(url, attempt + 1);
        }, retryDelay * (attempt + 1));
      } else {
        // Use fallback image
        const fallbackUrl = imageService.getFallbackImage(fallbackType);
        setState({
          isLoading: false,
          isLoaded: true,
          hasError: true,
          url: fallbackUrl
        });
      }
    }
  }, [preload, retryCount, retryDelay, fallbackType]);

  useEffect(() => {
    if (!imageUrl) {
      const fallbackUrl = imageService.getFallbackImage(fallbackType);
      setState({
        isLoading: false,
        isLoaded: true,
        hasError: false,
        url: fallbackUrl
      });
      return;
    }

    loadImage(imageUrl);
  }, [imageUrl, loadImage, fallbackType]);

  const retry = useCallback(() => {
    if (imageUrl) {
      setRetryAttempts(0);
      loadImage(imageUrl);
    }
  }, [imageUrl, loadImage]);

  return {
    ...state,
    retry,
    retryAttempts
  };
}

export function useImagePreloader(urls: string[]) {
  const [preloadedUrls, setPreloadedUrls] = useState<Set<string>>(new Set());
  const [isPreloading, setIsPreloading] = useState(false);

  const preloadImages = useCallback(async (imagesToPreload: string[]) => {
    if (imagesToPreload.length === 0) return;

    setIsPreloading(true);
    try {
      await imageService.preloadImages(imagesToPreload);
      setPreloadedUrls(prev => new Set([...prev, ...imagesToPreload]));
    } catch (error) {
      console.warn('Failed to preload some images:', error);
    } finally {
      setIsPreloading(false);
    }
  }, []);

  useEffect(() => {
    const urlsToPreload = urls.filter(url => !preloadedUrls.has(url));
    if (urlsToPreload.length > 0) {
      preloadImages(urlsToPreload);
    }
  }, [urls, preloadedUrls, preloadImages]);

  return {
    isPreloading,
    preloadedUrls: Array.from(preloadedUrls),
    preloadImages
  };
}