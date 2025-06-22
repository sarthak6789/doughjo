import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  Animated,
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { 
  Animated as ReanimatedView,
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler, 
  runOnJS,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { BookOpen, Filter, Search, Star, Clock, TrendingUp, Award, ChevronRight, Play, Bookmark, BookmarkCheck, RotateCcw, CircleCheck as CheckCircle, Circle, Target, Brain, Zap, Users, Calendar, ArrowLeft, ArrowRight, Heart, Share2, Download, Settings, CircleHelp as HelpCircle, X } from 'lucide-react-native';

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
  estimatedTime: number;
  rating: number;
  completedBy: number;
  tags: string[];
  prerequisites?: string[];
  nextLessons?: string[];
};

type LearningPath = {
  id: string;
  title: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  estimatedHours: number;
  difficulty: string;
  color: string;
  icon: string;
};

const learningPaths: LearningPath[] = [
  {
    id: 'path-1',
    title: 'Financial Foundations',
    description: 'Master the basics of personal finance',
    totalLessons: 12,
    completedLessons: 8,
    estimatedHours: 6,
    difficulty: 'Beginner',
    color: Colors.accent.teal,
    icon: 'foundation'
  },
  {
    id: 'path-2',
    title: 'Investment Mastery',
    description: 'Learn advanced investment strategies',
    totalLessons: 15,
    completedLessons: 3,
    estimatedHours: 10,
    difficulty: 'Advanced',
    color: Colors.accent.magenta,
    icon: 'trending-up'
  },
  {
    id: 'path-3',
    title: 'Credit & Debt Management',
    description: 'Optimize your credit and eliminate debt',
    totalLessons: 8,
    completedLessons: 5,
    estimatedHours: 4,
    difficulty: 'Intermediate',
    color: Colors.accent.yellow,
    icon: 'credit-card'
  }
];

const learningCards: LearningCard[] = [
  {
    id: 'card-1',
    title: 'Emergency Fund Essentials',
    category: 'Saving',
    difficulty: 'Beginner',
    image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg',
    content: 'An emergency fund is your financial safety net. Start with $500, then build to 3-6 months of expenses.',
    keyPoints: ['Start small with $500', 'Build to 3-6 months expenses', 'Keep in high-yield savings'],
    progress: 0.3,
    estimatedTime: 15,
    rating: 4.8,
    completedBy: 1250,
    tags: ['Emergency Fund', 'Savings', 'Financial Security'],
    nextLessons: ['card-2', 'card-4']
  },
  {
    id: 'card-2',
    title: 'Credit Score Mastery',
    category: 'Credit',
    difficulty: 'Beginner',
    image: 'https://images.pexels.com/photos/4386437/pexels-photo-4386437.jpeg',
    content: 'Your credit score affects loan rates and approval. Pay bills on time and keep credit utilization below 30%.',
    keyPoints: ['Pay bills on time', 'Keep utilization under 30%', 'Check score regularly'],
    progress: 0.6,
    estimatedTime: 20,
    rating: 4.9,
    completedBy: 980,
    tags: ['Credit Score', 'Credit Cards', 'Financial Health'],
    prerequisites: ['card-1']
  },
  {
    id: 'card-3',
    title: 'Investment Fundamentals',
    category: 'Investing',
    difficulty: 'Intermediate',
    image: 'https://images.pexels.com/photos/4386342/pexels-photo-4386342.jpeg',
    content: 'Diversification reduces risk. Start with index funds for broad market exposure and low fees.',
    keyPoints: ['Diversify your portfolio', 'Consider index funds', 'Think long-term'],
    progress: 0.1,
    estimatedTime: 30,
    rating: 4.7,
    completedBy: 750,
    tags: ['Investing', 'Index Funds', 'Portfolio'],
    prerequisites: ['card-1', 'card-2']
  },
  {
    id: 'card-4',
    title: 'Budgeting Made Simple',
    category: 'Budgeting',
    difficulty: 'Beginner',
    image: 'https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg',
    content: 'The 50/30/20 rule: 50% needs, 30% wants, 20% savings. Track expenses to stay on target.',
    keyPoints: ['50% for needs', '30% for wants', '20% for savings'],
    progress: 0.8,
    estimatedTime: 25,
    rating: 4.6,
    completedBy: 1100,
    tags: ['Budgeting', '50/30/20 Rule', 'Money Management']
  },
  {
    id: 'card-5',
    title: 'Compound Interest Power',
    category: 'Investing',
    difficulty: 'Intermediate',
    image: 'https://images.pexels.com/photos/4386405/pexels-photo-4386405.jpeg',
    content: 'Time is your greatest asset. Starting early with small amounts beats starting late with large amounts.',
    keyPoints: ['Start investing early', 'Consistency matters', 'Time beats timing'],
    progress: 0.2,
    estimatedTime: 18,
    rating: 4.9,
    completedBy: 890,
    tags: ['Compound Interest', 'Long-term Investing', 'Time Value']
  }
];

export default function LearnScreen() {
  const [currentView, setCurrentView] = useState<'overview' | 'cards' | 'paths'>('overview');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [bookmarkedCards, setBookmarkedCards] = useState<string[]>([]);
  const [completedCards, setCompletedCards] = useState<string[]>(['card-4']);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [selectedCard, setSelectedCard] = useState<LearningCard | null>(null);
  
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredCards = learningCards.filter(card => {
    const matchesDifficulty = selectedDifficulty === 'All' || card.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesDifficulty && matchesCategory && matchesSearch;
  });

  const currentCard = filteredCards[currentCardIndex];

  const toggleBookmark = (cardId: string) => {
    setBookmarkedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const markAsCompleted = (cardId: string) => {
    setCompletedCards(prev => 
      prev.includes(cardId) 
        ? prev
        : [...prev, cardId]
    );
  };

  const nextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
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
      // Swipe down to previous card
      else if (event.translationY > 100 && Math.abs(event.velocityY) > 500) {
        translateY.value = withTiming(screenHeight, { duration: 300 });
        runOnJS(previousCard)();
        translateY.value = withTiming(0, { duration: 0 });
      }
      // Swipe right to bookmark
      else if (event.translationX > 100 && Math.abs(event.velocityX) > 500) {
        translateX.value = withTiming(screenWidth, { duration: 300 });
        runOnJS(() => toggleBookmark(currentCard.id))();
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
      case 'Advanced': return Colors.accent.magenta;
      default: return Colors.text.tertiary;
    }
  };

  const renderOverview = () => (
    <ScrollView 
      style={styles.overviewContainer}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
    >
      {/* Hero Section */}
      <ReanimatedView entering={FadeIn.duration(600)} style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Continue Your Financial Journey</Text>
          <Text style={styles.heroSubtitle}>
            Master money management with personalized learning paths
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>12</Text>
              <Text style={styles.heroStatLabel}>Lessons Completed</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>4.8</Text>
              <Text style={styles.heroStatLabel}>Avg Rating</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>85%</Text>
              <Text style={styles.heroStatLabel}>Progress</Text>
            </View>
          </View>
        </View>
      </ReanimatedView>

      {/* Learning Paths */}
      <ReanimatedView entering={FadeIn.duration(600).delay(200)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Learning Paths</Text>
          <TouchableOpacity onPress={() => setCurrentView('paths')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {learningPaths.map((path, index) => (
            <ReanimatedView 
              key={path.id} 
              entering={SlideInRight.duration(400).delay(index * 100)}
              style={styles.pathCard}
            >
              <View style={[styles.pathHeader, { backgroundColor: path.color + '20' }]}>
                <TrendingUp color={path.color} size={24} />
                <Text style={[styles.pathDifficulty, { color: path.color }]}>
                  {path.difficulty}
                </Text>
              </View>
              <Text style={styles.pathTitle}>{path.title}</Text>
              <Text style={styles.pathDescription}>{path.description}</Text>
              
              <View style={styles.pathProgress}>
                <View style={styles.pathProgressBar}>
                  <View 
                    style={[
                      styles.pathProgressFill, 
                      { 
                        width: `${(path.completedLessons / path.totalLessons) * 100}%`,
                        backgroundColor: path.color
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.pathProgressText}>
                  {path.completedLessons}/{path.totalLessons} lessons
                </Text>
              </View>
              
              <View style={styles.pathFooter}>
                <View style={styles.pathTime}>
                  <Clock color={Colors.text.tertiary} size={16} />
                  <Text style={styles.pathTimeText}>{path.estimatedHours}h</Text>
                </View>
                <TouchableOpacity style={[styles.pathButton, { backgroundColor: path.color }]}>
                  <Text style={styles.pathButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </ReanimatedView>
          ))}
        </ScrollView>
      </ReanimatedView>

      {/* Quick Actions */}
      <ReanimatedView entering={FadeIn.duration(600).delay(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setCurrentView('cards')}
          >
            <View style={styles.quickActionIcon}>
              <Play color={Colors.accent.teal} size={24} />
            </View>
            <Text style={styles.quickActionText}>Start Learning</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Bookmark color={Colors.accent.magenta} size={24} />
            </View>
            <Text style={styles.quickActionText}>Bookmarks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Target color={Colors.accent.yellow} size={24} />
            </View>
            <Text style={styles.quickActionText}>Goals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Award color={Colors.accent.green} size={24} />
            </View>
            <Text style={styles.quickActionText}>Achievements</Text>
          </TouchableOpacity>
        </View>
      </ReanimatedView>

      {/* Recent Activity */}
      <ReanimatedView entering={FadeIn.duration(600).delay(600)} style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <CheckCircle color={Colors.accent.green} size={20} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Completed "Budgeting Made Simple"</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Star color={Colors.accent.yellow} size={20} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Bookmarked "Investment Fundamentals"</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Award color={Colors.accent.teal} size={20} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Earned "Quick Learner" badge</Text>
              <Text style={styles.activityTime}>3 days ago</Text>
            </View>
          </View>
        </View>
      </ReanimatedView>
    </ScrollView>
  );

  const renderCardView = () => {
    if (!currentCard) {
      return (
        <View style={styles.emptyState}>
          <BookOpen color={Colors.text.tertiary} size={64} />
          <Text style={styles.emptyTitle}>No lessons available</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
        </View>
      );
    }

    return (
      <GestureHandlerRootView style={styles.cardViewContainer}>
        {/* Card Navigation */}
        <View style={styles.cardNavigation}>
          <TouchableOpacity 
            style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]}
            onPress={previousCard}
            disabled={currentCardIndex === 0}
          >
            <ArrowLeft color={currentCardIndex === 0 ? Colors.text.tertiary : Colors.text.primary} size={20} />
          </TouchableOpacity>
          
          <View style={styles.cardCounter}>
            <Text style={styles.cardCounterText}>
              {currentCardIndex + 1} of {filteredCards.length}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.navButton, currentCardIndex === filteredCards.length - 1 && styles.navButtonDisabled]}
            onPress={nextCard}
            disabled={currentCardIndex === filteredCards.length - 1}
          >
            <ArrowRight color={currentCardIndex === filteredCards.length - 1 ? Colors.text.tertiary : Colors.text.primary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((currentCardIndex + 1) / filteredCards.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.cardContainer}>
          <PanGestureHandler onGestureEvent={panGestureHandler}>
            <ReanimatedView style={[styles.card, animatedCardStyle]}>
              <Image 
                source={{ uri: currentCard.image }} 
                style={styles.cardImage}
                resizeMode="cover"
              />
              
              <View style={styles.cardOverlay}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardBadges}>
                    <View style={styles.categoryBadge}>
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
                  
                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <Clock color={Colors.text.secondary} size={16} />
                      <Text style={styles.metaText}>{currentCard.estimatedTime}m</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Star color={Colors.accent.yellow} size={16} />
                      <Text style={styles.metaText}>{currentCard.rating}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Users color={Colors.text.secondary} size={16} />
                      <Text style={styles.metaText}>{currentCard.completedBy}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{currentCard.title}</Text>
                  <Text style={styles.cardText}>{currentCard.content}</Text>
                  
                  <View style={styles.keyPointsContainer}>
                    <Text style={styles.keyPointsTitle}>Key Learning Points:</Text>
                    {currentCard.keyPoints.map((point, index) => (
                      <View key={index} style={styles.keyPoint}>
                        <View style={styles.keyPointDot} />
                        <Text style={styles.keyPointText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              
              {/* Card Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.cardAction}
                  onPress={() => setSelectedCard(currentCard)}
                >
                  <HelpCircle color={Colors.text.secondary} size={20} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.cardAction,
                    bookmarkedCards.includes(currentCard.id) && styles.cardActionActive
                  ]}
                  onPress={() => toggleBookmark(currentCard.id)}
                >
                  {bookmarkedCards.includes(currentCard.id) ? (
                    <BookmarkCheck color={Colors.accent.teal} size={20} />
                  ) : (
                    <Bookmark color={Colors.text.secondary} size={20} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cardAction}>
                  <Share2 color={Colors.text.secondary} size={20} />
                </TouchableOpacity>
              </View>
            </ReanimatedView>
          </PanGestureHandler>
        </View>

        {/* Gesture Hints */}
        <View style={styles.gestureHints}>
          <View style={styles.gestureHint}>
            <Text style={styles.gestureText}>↑ Next lesson</Text>
          </View>
          <View style={styles.gestureHint}>
            <Text style={styles.gestureText}>↓ Previous lesson</Text>
          </View>
          <View style={styles.gestureHint}>
            <Text style={styles.gestureText}>→ Bookmark</Text>
          </View>
        </View>

        {/* Start Learning Button */}
        <TouchableOpacity 
          style={styles.startLearningButton}
          onPress={() => markAsCompleted(currentCard.id)}
        >
          <Play color={Colors.background.primary} size={20} />
          <Text style={styles.startLearningText}>Start Learning</Text>
        </TouchableOpacity>
      </GestureHandlerRootView>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentView('overview')}
        >
          <ArrowLeft color={Colors.text.primary} size={24} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {currentView === 'overview' ? 'Learn' : 
           currentView === 'cards' ? 'Learning Cards' : 'Learning Paths'}
        </Text>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowFilters(true)}
        >
          <Settings color={Colors.text.primary} size={24} />
        </TouchableOpacity>
      </View>
      
      {currentView !== 'overview' && (
        <View style={styles.headerControls}>
          <View style={styles.searchContainer}>
            <Search color={Colors.text.tertiary} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search lessons..."
              placeholderTextColor={Colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter color={Colors.accent.teal} size={20} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {currentView === 'overview' && renderOverview()}
      {currentView === 'cards' && renderCardView()}
      
      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <ReanimatedView entering={SlideInRight.duration(300)} style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X color={Colors.text.primary} size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Difficulty</Text>
              <View style={styles.filterOptions}>
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.filterOption,
                      selectedDifficulty === difficulty && styles.filterOptionActive
                    ]}
                    onPress={() => setSelectedDifficulty(difficulty)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedDifficulty === difficulty && styles.filterOptionTextActive
                    ]}>
                      {difficulty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterOptions}>
                {['All', 'Saving', 'Credit', 'Investing', 'Budgeting'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterOption,
                      selectedCategory === category && styles.filterOptionActive
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedCategory === category && styles.filterOptionTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.applyFiltersButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </ReanimatedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: Colors.background.secondary,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxl,
    color: Colors.text.primary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewContainer: {
    flex: 1,
  },
  heroSection: {
    padding: SPACING.xl,
    backgroundColor: Colors.background.secondary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxl,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxl,
    color: Colors.accent.teal,
    marginBottom: SPACING.xs,
  },
  heroStatLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
  },
  seeAllText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.accent.teal,
  },
  pathCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginRight: SPACING.lg,
    width: 280,
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
  pathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  pathDifficulty: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pathTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  pathDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    marginBottom: SPACING.lg,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  pathProgress: {
    marginBottom: SPACING.lg,
  },
  pathProgressBar: {
    height: 6,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  pathProgressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  pathProgressText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  pathFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pathTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathTimeText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.tertiary,
    marginLeft: SPACING.xs,
  },
  pathButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  pathButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.background.primary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
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
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quickActionText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
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
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  activityContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  activityTime: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.tertiary,
  },
  cardViewContainer: {
    flex: 1,
  },
  cardNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  cardCounter: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  cardCounterText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.full,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: screenWidth - (SPACING.lg * 2),
    height: screenHeight * 0.65,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  cardImage: {
    width: '100%',
    height: '50%',
  },
  cardOverlay: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: Colors.background.secondary,
  },
  cardHeader: {
    marginBottom: SPACING.lg,
  },
  cardBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  categoryBadge: {
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  categoryText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  difficultyText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    marginLeft: SPACING.xs,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    marginBottom: SPACING.md,
    lineHeight: FONT_SIZE.xl * 1.3,
  },
  cardText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: FONT_SIZE.md * 1.4,
    marginBottom: SPACING.lg,
  },
  keyPointsContainer: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  keyPointsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
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
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
  cardActions: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  cardAction: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardActionActive: {
    backgroundColor: Colors.accent.teal + '80',
  },
  gestureHints: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  gestureHint: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  gestureText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.xs,
    color: Colors.text.tertiary,
  },
  startLearningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent.teal,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: Colors.accent.teal,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startLearningText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.background.primary,
    marginLeft: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  filterTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
  },
  filterSection: {
    marginBottom: SPACING.xl,
  },
  filterSectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterOption: {
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  filterOptionActive: {
    backgroundColor: Colors.accent.teal,
    borderColor: Colors.accent.teal,
  },
  filterOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
  },
  filterOptionTextActive: {
    color: Colors.background.primary,
  },
  applyFiltersButton: {
    backgroundColor: Colors.accent.teal,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    shadowColor: Colors.accent.teal,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  applyFiltersText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.background.primary,
  },
});