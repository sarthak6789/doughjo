import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Lock, BookmarkPlus, BookmarkCheck } from 'lucide-react-native';
import { router } from 'expo-router';

type LessonCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  progress: number;
  lessons: number;
  completedLessons: number;
  belt: string;
  locked: boolean;
  bookmarked?: boolean;
  onBookmark?: () => void;
};

export const LessonCard = ({ 
  title, 
  description, 
  icon, 
  progress, 
  lessons, 
  completedLessons,
  belt,
  locked,
  bookmarked,
  onBookmark
}: LessonCardProps) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    if (!locked) {
      // Navigate to lesson content - you can customize this route
      router.push(`/(tabs)/learn`);
    }
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity 
        style={[
          styles.container,
          locked && styles.lockedContainer
        ]}
        disabled={locked}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        {/* Card Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            <Text style={styles.description} numberOfLines={2}>{description}</Text>
          </View>
          <View style={styles.actionContainer}>
            {locked ? (
              <View style={styles.lockContainer}>
                <Lock color={Colors.text.tertiary} size={18} />
              </View>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.bookmarkContainer,
                  bookmarked && styles.bookmarkContainerActive
                ]}
                onPress={onBookmark}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {bookmarked ? (
                  <BookmarkCheck color={Colors.accent.teal} size={18} />
                ) : (
                  <BookmarkPlus color={Colors.text.tertiary} size={18} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Progress Section */}
        {!locked && (
          <View style={styles.progressSection}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress * 100}%` }
                  ]} 
                />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {completedLessons}/{lessons} lessons completed
                </Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
            </View>
            
            <View style={styles.beltSection}>
              <View style={[
                styles.beltIndicator,
                { backgroundColor: Colors.belt[belt as keyof typeof Colors.belt] }
              ]} />
              <Text style={styles.beltText}>{belt} belt</Text>
            </View>
          </View>
        )}

        {/* Locked State Overlay */}
        {locked && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockedText}>Complete previous lessons to unlock</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: SPACING.lg,
  },
  container: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  lockedContainer: {
    opacity: 0.7,
    backgroundColor: Colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    shadowColor: Colors.accent.teal,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
    lineHeight: FONT_SIZE.lg * 1.3,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  actionContainer: {
    alignItems: 'center',
  },
  lockContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  bookmarkContainerActive: {
    backgroundColor: Colors.accent.teal + '20',
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.card.border,
    paddingTop: SPACING.md,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBackground: {
    height: 8,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: Colors.accent.teal,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  progressPercentage: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.teal,
  },
  beltSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.tertiary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  beltIndicator: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  beltText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },
  lockedOverlay: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  lockedText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});