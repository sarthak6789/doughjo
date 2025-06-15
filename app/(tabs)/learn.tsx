import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler, 
  runOnJS,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { 
  Wallet, 
  PiggyBank, 
  CreditCard, 
  TrendingUp, 
  BadgeDollarSign, 
  ChartLine, 
  BookmarkPlus, 
  BookmarkCheck,
  ArrowUp,
  ArrowRight,
  Filter,
  Star
} from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type LearningCard = {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  content: string;
  keyPoints: string[];
  progress: number;
};

const learningCards: LearningCard[] = [
  {
    id: 'card-1',
    title: 'Emergency Fund Essentials',
    category: 'Saving',
    difficulty: 'Beginner',
    image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg',
    content: 'An emergency fund is your financial safety net. Start with $500, then build to 3-6 months of expenses.',
    keyPoints: ['Start small with $500', 'Build to 3-6 months expenses', 'Keep in high-yield savings'],
    progress: 0.3
  },
  {
    id: 'card-2',
    title: 'Credit Score Basics',
    category: 'Credit',
    difficulty: 'Beginner',
    image: 'https://images.pexels.com/photos/4386437/pexels-photo-4386437.jpeg',
    content: 'Your credit score affects loan rates and approval. Pay bills on time and keep credit utilization below 30%.',
    keyPoints: ['Pay bills on time', 'Keep utilization under 30%', 'Check score regularly'],
    progress: 0.6
  },
  {
    id: 'card-3',
    title: 'Investment Fundamentals',
    category: 'Investing',
    difficulty: 'Intermediate',
    image: 'https://images.pexels.com/photos/4386342/pexels-photo-4386342.jpeg',
    content: 'Diversification reduces risk. Start with index funds for broad market exposure and low fees.',
    keyPoints: ['Diversify your portfolio', 'Consider index funds', 'Think long-term'],
    progress: 0.1
  },
  {
    id: 'card-4',
    title: 'Budgeting Made Simple',
    category: 'Budgeting',
    difficulty: 'Beginner',
    image: 'https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg',
    content: 'The 50/30/20 rule: 50% needs, 30% wants, 20% savings. Track expenses to stay on target.',
    keyPoints: ['50% for needs', '30% for wants', '20% for savings'],
    progress: 0.8
  },
  {
    id: 'card-5',
    title: 'Compound Interest Power',
    category: 'Investing',
    difficulty: 'Intermediate',
    image: 'https://images.pexels.com/photos/4386405/pexels-photo-4386405.jpeg',
    content: 'Time is your greatest asset. Starting early with small amounts beats starting late with large amounts.',
    keyPoints: ['Start investing early', 'Consistency matters', 'Time beats timing'],
    progress: 0.2
  }
];

export default function LearnScreen() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [bookmarkedCards, setBookmarkedCards] = useState<string[]>([]);
  const [highlightedCards, setHighlightedCards] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const filteredCards = selectedDifficulty === 'All' 
    ? learningCards 
    : learningCards.filter(card => card.difficulty === selectedDifficulty);

  const currentCard = filteredCards[currentCardIndex];

  const toggleBookmark = (cardId: string) => {
    setBookmarkedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const toggleHighlight = (cardId: string) => {
    setHighlightedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const nextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const bookmarkCard = () => {
    if (currentCard) {
      toggleBookmark(currentCard.id);
    }
  };

  const panGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.95);
    },
    onActive: (event) => {
      translateY.value = event.translationY;
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      scale.value = withSpring(1);
      
      // Swipe up to next card
      if (event.translationY < -100 && Math.abs(event.velocityY) > 500) {
        translateY.value = withTiming(-screenHeight, { duration: 300 });
        runOnJS(nextCard)();
        translateY.value = withTiming(0, { duration: 0 });
      }
      // Swipe right to bookmark
      else if (event.translationX > 100 && Math.abs(event.velocityX) > 500) {
        translateX.value = withTiming(screenWidth, { duration: 300 });
        runOnJS(bookmarkCard)();
        translateX.value = withTiming(0, { duration: 300 });
      }
      // Return to center
      else {
        translateY.value = withSpring(0);
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-10, 0, 10],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
        { rotateZ: `${rotateZ}deg` },
      ],
    };
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return Colors.accent.green;
      case 'Intermediate': return Colors.accent.yellow;
      case 'Advanced': return Colors.accent.red;
      default: return Colors.text.tertiary;
    }
  };

  if (!currentCard) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No cards available</Text>
          <Text style={styles.emptySubtitle}>Try changing the difficulty filter</Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Learning Cards</Text>
          <Text style={styles.subtitle}>Swipe up for next • Swipe right to bookmark</Text>
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {
              const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
              const currentIndex = difficulties.indexOf(selectedDifficulty);
              const nextIndex = (currentIndex + 1) % difficulties.length;
              setSelectedDifficulty(difficulties[nextIndex]);
              setCurrentCardIndex(0);
            }}
          >
            <Filter color={Colors.accent.teal} size={20} />
            <Text style={styles.filterText}>{selectedDifficulty}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentCardIndex + 1) / filteredCards.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentCardIndex + 1} of {filteredCards.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <PanGestureHandler onGestureEvent={panGestureHandler}>
          <Animated.View style={[styles.card, animatedCardStyle]}>
            <Image 
              source={{ uri: currentCard.image }} 
              style={styles.cardImage}
              resizeMode="cover"
            />
            
            <View style={styles.cardOverlay}>
              <View style={styles.cardHeader}>
                <View style={styles.categoryContainer}>
                  <Text style={styles.categoryText}>{currentCard.category}</Text>
                </View>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(currentCard.difficulty) + '20' }
                ]}>
                  <Text style={[
                    styles.difficultyText,
                    { color: getDifficultyColor(currentCard.difficulty) }
                  ]}>
                    {currentCard.difficulty}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{currentCard.title}</Text>
                <Text style={styles.cardText}>{currentCard.content}</Text>
                
                <View style={styles.keyPointsContainer}>
                  {currentCard.keyPoints.map((point, index) => (
                    <View key={index} style={styles.keyPoint}>
                      <View style={styles.keyPointDot} />
                      <Text style={styles.keyPointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            {highlightedCards.includes(currentCard.id) && (
              <View style={styles.highlightOverlay}>
                <Star color={Colors.accent.yellow} size={24} />
              </View>
            )}
          </Animated.View>
        </PanGestureHandler>
      </View>

      <View style={styles.gestureHints}>
        <View style={styles.gestureHint}>
          <ArrowUp color={Colors.text.tertiary} size={20} />
          <Text style={styles.gestureText}>Swipe up for next card</Text>
        </View>
        <View style={styles.gestureHint}>
          <ArrowRight color={Colors.text.tertiary} size={20} />
          <Text style={styles.gestureText}>Swipe right to bookmark</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[
            styles.actionButton,
            bookmarkedCards.includes(currentCard.id) && styles.actionButtonActive
          ]}
          onPress={() => toggleBookmark(currentCard.id)}
        >
          {bookmarkedCards.includes(currentCard.id) ? (
            <BookmarkCheck color={Colors.accent.teal} size={24} />
          ) : (
            <BookmarkPlus color={Colors.text.tertiary} size={24} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton,
            highlightedCards.includes(currentCard.id) && styles.actionButtonActive
          ]}
          onPress={() => toggleHighlight(currentCard.id)}
        >
          <Star 
            color={highlightedCards.includes(currentCard.id) ? Colors.accent.yellow : Colors.text.tertiary} 
            size={24} 
          />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxl,
    color: Colors.text.primary,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    marginTop: SPACING.xs,
  },
  filterContainer: {
    alignItems: 'flex-end',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.primary,
    marginLeft: SPACING.xs,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: screenWidth - (SPACING.lg * 2),
    height: screenHeight * 0.6,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '60%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.xs,
    color: Colors.text.secondary,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  difficultyText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xs,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  cardText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  keyPointsContainer: {
    marginTop: SPACING.sm,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  keyPointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.teal,
    marginRight: SPACING.sm,
  },
  keyPointText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.primary,
  },
  highlightOverlay: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: 'rgba(255, 214, 0, 0.2)',
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.sm,
  },
  gestureHints: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  gestureHint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gestureText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.xs,
    color: Colors.text.tertiary,
    marginLeft: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: Colors.background.tertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});