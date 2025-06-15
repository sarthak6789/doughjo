import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Brain, Check, X } from 'lucide-react-native';

const DOUGH_COIN_IMAGE = 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg';

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
        return Colors.accent.teal;
      case 'medium':
        return Colors.accent.yellow;
      case 'hard':
        return Colors.accent.magenta;
      default:
        return Colors.text.secondary;
    }
  };

  return (
    <View style={styles.container}>
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
      
      <Text style={styles.title}>{quiz.title}</Text>
      <Text style={styles.question}>{quiz.question}</Text>
      
      <View style={styles.optionsContainer}>
        {quiz.options.map((option, index) => {
          let optionStyle = styles.option;
          let textStyle = styles.optionText;
          
          if (showResult && index === quiz.correctAnswer) {
            optionStyle = [styles.option, styles.correctOption];
            textStyle = [styles.optionText, styles.correctOptionText];
          } else if (showResult && selectedAnswer === index && index !== quiz.correctAnswer) {
            optionStyle = [styles.option, styles.incorrectOption];
            textStyle = [styles.optionText, styles.incorrectOptionText];
          } else if (selectedAnswer === index && !showResult) {
            optionStyle = [styles.option, styles.selectedOption];
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => handleAnswerSelect(index)}
              disabled={isAnswered}
            >
              <Text style={textStyle}>{option}</Text>
              {showResult && index === quiz.correctAnswer && (
                <Check color={Colors.background.primary} size={16} />
              )}
              {showResult && selectedAnswer === index && index !== quiz.correctAnswer && (
                <X color={Colors.background.primary} size={16} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
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
            <Check color={Colors.accent.teal} size={16} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    width: 280,
    minHeight: 320,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    marginLeft: SPACING.xs,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  difficulty: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  question: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    marginBottom: SPACING.lg,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  optionsContainer: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  option: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: Colors.accent.teal + '20',
    borderWidth: 1,
    borderColor: Colors.accent.teal,
  },
  correctOption: {
    backgroundColor: Colors.accent.teal,
  },
  incorrectOption: {
    backgroundColor: Colors.accent.magenta,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    flex: 1,
  },
  correctOptionText: {
    color: Colors.background.primary,
  },
  incorrectOptionText: {
    color: Colors.background.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 0, 0.2)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  coinIcon: {
    width: 16,
    height: 16,
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
  },
  completedText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.teal,
    marginLeft: SPACING.xs,
  },
});