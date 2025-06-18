import React, { useState } from 'react';
import { Image, View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useImageLoader } from '@/hooks/useImageLoader';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { RefreshCw, CircleAlert as AlertCircle } from 'lucide-react-native';

interface OptimizedImageProps {
  source: string | null | undefined;
  style?: any;
  fallbackType?: 'lesson' | 'category' | 'quiz' | 'profile';
  showRetryButton?: boolean;
  showLoadingIndicator?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: (error: any) => void;
  alt?: string;
  placeholder?: React.ReactNode;
}

export function OptimizedImage({
  source,
  style,
  fallbackType = 'lesson',
  showRetryButton = true,
  showLoadingIndicator = true,
  resizeMode = 'cover',
  onLoad,
  onError,
  alt,
  placeholder
}: OptimizedImageProps) {
  const { isLoading, isLoaded, hasError, url, retry, retryAttempts } = useImageLoader(source, {
    fallbackType,
    preload: true,
    retryCount: 2,
    retryDelay: 1000
  });

  const [imageLoadError, setImageLoadError] = useState(false);

  const handleImageLoad = () => {
    setImageLoadError(false);
    onLoad?.();
  };

  const handleImageError = (error: any) => {
    setImageLoadError(true);
    onError?.(error);
  };

  const handleRetry = () => {
    setImageLoadError(false);
    retry();
  };

  if (isLoading && showLoadingIndicator) {
    return (
      <View style={[styles.container, style]}>
        {placeholder || (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.accent.teal} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </View>
    );
  }

  if ((hasError || imageLoadError) && showRetryButton) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <AlertCircle color={Colors.text.tertiary} size={24} />
          <Text style={styles.errorText}>Failed to load image</Text>
          {retryAttempts < 3 && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <RefreshCw color={Colors.accent.teal} size={16} />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (!url) {
    return (
      <View style={[styles.container, style]}>
        {placeholder || <View style={styles.placeholderContainer} />}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      style={style}
      resizeMode={resizeMode}
      onLoad={handleImageLoad}
      onError={handleImageError}
      accessibilityLabel={alt}
      accessibilityRole="image"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.tertiary,
    marginTop: SPACING.sm,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.tertiary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  retryText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.teal,
    marginLeft: SPACING.xs,
  },
  placeholderContainer: {
    backgroundColor: Colors.background.tertiary,
    width: '100%',
    height: '100%',
  },
});