import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Award, Flame, PiggyBank, Brain, TrendingUp, CreditCard } from 'lucide-react-native';

type ProgressBadgeProps = {
  name: string;
  icon: string;
  color: string;
  completed: boolean;
  onPress?: () => void;
};

export const ProgressBadge = ({ name, icon, color, completed, onPress }: ProgressBadgeProps) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
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

  const renderIcon = () => {
    const iconProps = {
      size: 24,
      color: completed ? color : Colors.text.tertiary,
    };
    
    switch (icon) {
      case 'award':
        return <Award {...iconProps} />;
      case 'flame':
        return <Flame {...iconProps} />;
      case 'piggy-bank':
        return <PiggyBank {...iconProps} />;
      case 'brain':
        return <Brain {...iconProps} />;
      case 'trending-up':
        return <TrendingUp {...iconProps} />;
      case 'credit-card':
        return <CreditCard {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  const BadgeContent = () => (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
      <View 
        style={[
          styles.iconContainer,
          { 
            backgroundColor: completed ? `${color}20` : Colors.background.tertiary,
            borderColor: completed ? `${color}40` : Colors.card.border,
          }
        ]}
      >
        {renderIcon()}
        {completed && (
          <View style={styles.completedIndicator}>
            <Award color={Colors.background.primary} size={12} />
          </View>
        )}
      </View>
      <Text 
        style={[
          styles.name,
          { color: completed ? Colors.text.primary : Colors.text.tertiary }
        ]}
        numberOfLines={2}
      >
        {name}
      </Text>
      {completed && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Earned</Text>
        </View>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <BadgeContent />
      </TouchableOpacity>
    );
  }

  return <BadgeContent />;
};

const styles = StyleSheet.create({
  touchable: {
    width: '23%',
    marginBottom: SPACING.lg,
  },
  container: {
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.card.border,
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent.green,
    borderRadius: BORDER_RADIUS.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.secondary,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: FONT_SIZE.sm * 1.3,
    marginBottom: SPACING.xs,
  },
  completedBadge: {
    backgroundColor: Colors.accent.green + '20',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: Colors.accent.green + '40',
  },
  completedText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xs,
    color: Colors.accent.green,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});