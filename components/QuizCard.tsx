import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Brain, Check, X, Trophy } from 'lucide-react-native';

interface Quiz {
  id: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: number;
  reward: number;
  difficulty: string;
  category: string;
}

interface QuizCardProps {
  quiz: Quiz;
  completed: boolean;
  onComplete: (quizId: string, isCorrect: boolean, reward: number) => void;
}

export function QuizCard({ quiz, completed, onComplete }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(completed);
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

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setIsAnswered(true);
    
    const isCorrect = answerIndex === quiz.correctAnswer;
    onComplete(quiz.id, isCorrect, quiz.reward);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.accent.green;
      case 'medium':
        return Colors.accent.yellow;
      case 'hard':
        return Colors.accent.magenta;
      default:
        return Colors.text.secondary;
    }
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={[styles.container, completed && styles.completedContainer]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        disabled={isAnswered}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <Brain color={Colors.accent.magenta} size={16} />
            <Text style={styles.category}>{quiz.category}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quiz.difficulty) + '20' }]}>
            <Text style={[styles.difficulty, { color: getDifficultyColor(quiz.difficulty) }]}>
              {quiz.difficulty}
            </Text>
          </View>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{quiz.title}</Text>
          <Text style={styles.question}>{quiz.question}</Text>
        </View>
        
        {/* Options */}
        <View style={styles.optionsContainer}>
          {quiz.options.map((option, index) => {
            let optionStyle = styles.option;
            let textStyle = styles.optionText;
            let iconComponent = null;
            
            if (showResult && index === quiz.correctAnswer) {
              optionStyle = [styles.option, styles.correctOption];
              textStyle = [styles.optionText, styles.correctOptionText];
              iconComponent = <Check color={Colors.background.primary} size={16} />;
            } else if (showResult && selectedAnswer === index && index !== quiz.correctAnswer) {
              optionStyle = [styles.option, styles.incorrectOption];
              textStyle = [styles.optionText, styles.incorrectOptionText];
              iconComponent = <X color={Colors.background.primary} size={16} />;
            }
            
            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleAnswerSelect(index)}
                disabled={isAnswered}
              >
                <Text style={textStyle} numberOfLines={2}>{option}</Text>
                {iconComponent && (
                  <View style={styles.optionIcon}>
                    {iconComponent}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.rewardContainer}>
            <Image 
              source={require('@/assets/images/coin.png')} 
              style={styles.coinIcon} 
              resizeMode="contain"
            />
            <Text style={styles.rewardText}>+{quiz.reward}</Text>
          </View>
          
          {completed && (
            <View style={styles.completedBadge}>
              <Trophy color={Colors.accent.teal} size={16} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>

        {/* Success Overlay */}
        {showResult && selectedAnswer === quiz.correctAnswer && (
          <View style={styles.successOverlay}>
            <View style={styles.successContent}>
              <Check color={Colors.accent.green} size={24} />
              <Text style={styles.successText}>Correct!</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginRight: SPACING.lg,
  },
  container: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: 300,
    minHeight: 380,
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
    position: 'relative',
  },
  completedContainer: {
    borderColor: Colors.accent.teal,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  category: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    marginLeft: SPACING.xs,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  difficulty: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZE.lg * 1.3,
  },
  question: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  optionsContainer: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
  option: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    transition: 'all 0.2s ease',
  },
  correctOption: {
    backgroundColor: Colors.accent.green,
    borderColor: Colors.accent.green,
  },
  incorrectOption: {
    backgroundColor: Colors.accent.magenta,
    borderColor: Colors.accent.magenta,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: FONT_SIZE.md * 1.3,
  },
  correctOptionText: {
    color: Colors.background.primary,
  },
  incorrectOptionText: {
    color: Colors.background.primary,
  },
  optionIcon: {
    marginLeft: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.card.border,
    paddingTop: SPACING.md,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 0, 0.15)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: Colors.accent.yellow + '30',
  },
  coinIcon: {
    width: 18,
    height: 18,
    marginRight: SPACING.xs,
  },
  rewardText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.yellow,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent.teal + '20',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: Colors.accent.teal + '30',
  },
  completedText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.teal,
    marginLeft: SPACING.xs,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  successText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.accent.green,
    marginTop: SPACING.sm,
  },
});