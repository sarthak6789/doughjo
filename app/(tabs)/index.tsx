import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@/constants/Theme';
import { Lock, Check, TrendingUp, PiggyBank, CreditCard, Wallet, BadgeDollarSign, ChartLine as LineChart, Trophy, Star } from 'lucide-react-native';
import { StreakCounter } from '@/components/StreakCounter';
import { LessonCard } from '@/components/LessonCard';
import { SenseiDashboard } from '@/components/Sensei';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [streakDays, setStreakDays] = useState(3);
  const [doughCoins, setDoughCoins] = useState(120);
  const [currentBelt, setCurrentBelt] = useState('yellow');
  
  // Get current time in India (IST, UTC+5:30)
  const greeting = useMemo(() => {
    const now = new Date();
    // Convert to IST (India Standard Time)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istOffset = 5.5 * 60 * 60000; // 5 hours 30 minutes in ms
    const istTime = new Date(utc + istOffset);
    const hour = istTime.getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with greeting and stats */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.subGreeting}>Ready to level up your money skills?</Text>
          </View>
          <View style={styles.statsContainer}>
            <StreakCounter days={streakDays} />
            <View style={styles.coinsContainer}>
              <Image 
                source={require('@/assets/images/coin.png')} 
                style={styles.coinIcon} 
                resizeMode="contain"
              />
              <Text style={styles.coinsText}>{doughCoins}</Text>
            </View>
          </View>
        </View>
        
        {/* Sensei section */}
        <View style={styles.senseiSection}>
          <SenseiDashboard style={styles.senseiImage} />
          <View style={styles.senseiMessageContainer}>
            <Text style={styles.senseiMessage}>
              "Train daily. Master your money."
            </Text>
          </View>
        </View>
        
        {/* Skill Tree / Dojos */}
        <View style={styles.skillTreeContainer}>
          <View style={styles.skillTreeHeader}>
            <Trophy color={Colors.accent.yellow} size={24} />
            <Text style={styles.sectionTitle}>Your Financial Dojo</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Master each dojo to earn your black belt</Text>
          
          <View style={styles.lessonCardsContainer}>
            {/* Budgeting Dojo */}
            <LessonCard
              title="Budgeting Basics"
              description="Learn to create and stick to a budget"
              icon={<Wallet color={Colors.accent.teal} size={24} />}
              progress={0.8}
              lessons={5}
              completedLessons={4}
              belt="green"
              locked={false}
            />
            
            {/* Saving Dojo */}
            <LessonCard
              title="Saving Sensei"
              description="Discover strategies to save money effectively"
              icon={<PiggyBank color={Colors.accent.teal} size={24} />}
              progress={0.4}
              lessons={5}
              completedLessons={2}
              belt="yellow"
              locked={false}
            />
            
            {/* Credit Dojo */}
            <LessonCard
              title="Credit Card Master"
              description="Use credit responsibly and build your score"
              icon={<CreditCard color={Colors.accent.teal} size={24} />}
              progress={0.2}
              lessons={5}
              completedLessons={1}
              belt="white"
              locked={false}
            />
            
            {/* Investing Dojo - Locked */}
            <LessonCard
              title="Investing 101"
              description="Start your journey into investing"
              icon={<TrendingUp color={Colors.text.tertiary} size={24} />}
              progress={0}
              lessons={5}
              completedLessons={0}
              belt="white"
              locked={true}
            />
            
            {/* Taxes Dojo - Locked */}
            <LessonCard
              title="Tax Tactics"
              description="Understand taxes and maximize returns"
              icon={<BadgeDollarSign color={Colors.text.tertiary} size={24} />}
              progress={0}
              lessons={5}
              completedLessons={0}
              belt="white"
              locked={true}
            />
            
            {/* Advanced Investing - Locked */}
            <LessonCard
              title="Advanced Investing"
              description="Level up your investment strategies"
              icon={<LineChart color={Colors.text.tertiary} size={24} />}
              progress={0}
              lessons={5}
              completedLessons={0}
              belt="white"
              locked={true}
            />
          </View>
        </View>
        
        {/* Achievement Showcase */}
        <View style={styles.achievementContainer}>
          <View style={styles.achievementHeader}>
            <Star color={Colors.accent.yellow} size={24} />
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
          </View>
          
          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Trophy color={Colors.accent.yellow} size={20} />
            </View>
            <View style={styles.achievementTextContainer}>
              <Text style={styles.achievementTitle}>Quiz Master</Text>
              <Text style={styles.achievementDescription}>
                Completed 3 daily quizzes in a row!
              </Text>
            </View>
            <View style={styles.achievementReward}>
              <Image 
                source={require('@/assets/images/coin.png')} 
                style={styles.achievementCoin} 
                resizeMode="contain"
              />
              <Text style={styles.achievementRewardText}>+50</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  greetingContainer: {
    marginBottom: SPACING.md,
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
  },
  subGreeting: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  coinIcon: {
    width: 24,
    height: 24,
    marginRight: SPACING.xs,
  },
  coinsText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.accent.yellow,
  },
  senseiSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  senseiImage: {
    width: 120,
    height: 120,
    flexShrink: 0,
    marginRight: SPACING.lg,
  },
  senseiMessageContainer: {
    flex: 1,
    marginLeft: 0,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  senseiMessage: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    fontStyle: 'italic',
  },
  skillTreeContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  skillTreeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  lessonCardsContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    marginLeft: SPACING.sm,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    marginBottom: SPACING.lg,
    paddingHorizontal: 0,
  },
  achievementContainer: {
    paddingHorizontal: SPACING.lg,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  achievementCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  achievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 0, 0.2)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  achievementCoin: {
    width: 20,
    height: 20,
    marginRight: SPACING.xs,
  },
  achievementRewardText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.accent.yellow,
  },
});