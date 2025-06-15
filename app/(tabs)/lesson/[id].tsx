import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Quiz } from '@/components/LessonContent';
import { lessons } from '@/constants/Lessons';
import { SenseiSuccess } from '@/components/Sensei';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const lessonContent = lessons.budgetingBasics.find(lesson => lesson.id === id);

  if (!lessonContent) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (lessonContent.type === 'interactive' && 
            lessonContent.quiz && 
            currentStep < lessonContent.quiz.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          router.back();
        }
      }, 2000);
    } else {
      if (lessonContent.type === 'interactive' && 
          lessonContent.quiz && 
          currentStep < lessonContent.quiz.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        router.back();
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={Colors.text.primary} size={24} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${(currentStep + 1) * (100 / (lessonContent.type === 'interactive' ? lessonContent.quiz?.length || 1 : 1))}%` 
                }
              ]} 
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{lessonContent.title}</Text>
        
        {lessonContent.type === 'interactive' && lessonContent.quiz && (
          <>
            {showSuccess ? (
              <Animated.View 
                entering={FadeIn.duration(400)}
                style={styles.successContainer}
              >
                <SenseiSuccess style={styles.senseiSuccess} />
                <Text style={styles.successText}>Great job! Keep going!</Text>
              </Animated.View>
            ) : (
              <Quiz
                question={lessonContent.quiz[currentStep].question}
                options={lessonContent.quiz[currentStep].options.map((text, index) => ({
                  id: index.toString(),
                  text,
                }))}
                correctAnswer={lessonContent.quiz[currentStep].answer.toString()}
                onAnswer={handleQuizAnswer}
              />
            )}
          </>
        )}
        
        {lessonContent.type === 'text' && (
          <Text style={styles.contentText}>{lessonContent.content}</Text>
        )}

        {lessonContent.type === 'challenge' && (
          <View style={styles.challengeContainer}>
            <Text style={styles.challengeTitle}>Challenge Time!</Text>
            <Text style={styles.challengeDescription}>
              {lessonContent.scenario.description}
            </Text>
            {lessonContent.scenario.categories.map((category, index) => (
              <View key={index} style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <Text style={styles.categoryTarget}>Target: ${category.target}</Text>
                <View style={styles.itemsContainer}>
                  {category.items.map((item, itemIndex) => (
                    <Text key={itemIndex} style={styles.itemText}>• {item}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: Colors.background.secondary,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.md,
  },
  progressContainer: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.full,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxl,
    color: Colors.text.primary,
    marginBottom: SPACING.xl,
  },
  contentText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    lineHeight: 28,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  senseiSuccess: {
    width: 200,
    height: 200,
    marginBottom: SPACING.lg,
  },
  successText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.accent.green,
    textAlign: 'center',
  },
  challengeContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  challengeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  challengeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    marginBottom: SPACING.lg,
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
  },
  categoryTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  categoryTarget: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.accent.teal,
    marginBottom: SPACING.sm,
  },
  itemsContainer: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  itemText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    marginBottom: SPACING.xs,
  },
});