/*
  # Complete DoughJo Database Schema Setup

  1. New Tables
    - `profiles` - User profile information with belt levels, coins, streaks
    - `lessons` - Educational content with categories and difficulty levels
    - `quizzes` - Quiz questions with multiple choice answers
    - `user_progress` - Track lesson completion and progress
    - `quiz_attempts` - Record quiz attempts and results
    - `bookmarks` - User bookmarked lessons
    - `achievements` - Available achievements in the system
    - `user_achievements` - User earned achievements
    - `study_sessions` - Track study time and sessions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for lessons, quizzes, and achievements

  3. Functions & Triggers
    - Auto-create profile on user signup
    - Update profile stats on lesson/quiz completion
*/

-- Create enhanced profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  belt_level TEXT DEFAULT 'white',
  dough_coins INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_quizzes_completed INTEGER DEFAULT 0,
  current_streak_start TIMESTAMP WITH TIME ZONE,
  longest_streak INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{"notifications": true, "theme": "dark", "language": "en"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  content JSONB NOT NULL,
  belt_required TEXT DEFAULT 'white',
  order_index INTEGER NOT NULL,
  estimated_time INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  progress DECIMAL DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create enhanced quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement JSONB NOT NULL,
  reward_coins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Lessons policies (public read)
CREATE POLICY "Anyone can view lessons" ON lessons
  FOR SELECT USING (true);

-- Quizzes policies (public read)
CREATE POLICY "Anyone can view quizzes" ON quizzes
  FOR SELECT USING (true);

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Quiz attempts policies
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view own study sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Create function to update profile stats
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update lesson completion count
  UPDATE profiles 
  SET total_lessons_completed = (
    SELECT COUNT(*) FROM user_progress 
    WHERE user_id = NEW.user_id AND completed = true
  ),
  updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lesson completion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_lesson_completed'
  ) THEN
    CREATE TRIGGER on_lesson_completed
      AFTER INSERT OR UPDATE ON user_progress
      FOR EACH ROW 
      WHEN (NEW.completed = true)
      EXECUTE FUNCTION update_profile_stats();
  END IF;
END $$;

-- Create function to update quiz stats
CREATE OR REPLACE FUNCTION update_quiz_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update quiz completion count
  UPDATE profiles 
  SET total_quizzes_completed = (
    SELECT COUNT(*) FROM quiz_attempts 
    WHERE user_id = NEW.user_id
  ),
  updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quiz completion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_quiz_completed'
  ) THEN
    CREATE TRIGGER on_quiz_completed
      AFTER INSERT ON quiz_attempts
      FOR EACH ROW 
      EXECUTE FUNCTION update_quiz_stats();
  END IF;
END $$;

-- Insert sample lessons
INSERT INTO lessons (title, description, category, difficulty, content, belt_required, order_index, estimated_time) VALUES
('Budget Basics', 'Learn the fundamentals of budgeting', 'Budgeting', 'Beginner', '{"type": "text", "content": "A budget is your financial roadmap..."}', 'white', 1, 15),
('Emergency Fund 101', 'Build your emergency fund', 'Saving', 'Beginner', '{"type": "text", "content": "An emergency fund is crucial..."}', 'white', 2, 20),
('Credit Score Fundamentals', 'Understand credit scores', 'Credit', 'Beginner', '{"type": "text", "content": "Your credit score affects..."}', 'yellow', 3, 25)
ON CONFLICT DO NOTHING;

-- Insert sample quizzes
INSERT INTO quizzes (title, question, options, correct_answer, category, difficulty, reward) VALUES
('Emergency Fund Quiz', 'How many months of expenses should you save?', '["1-2 months", "3-6 months", "7-9 months", "10+ months"]', 1, 'Saving', 'Easy', 20),
('Credit Score Quiz', 'What is considered a good credit score?', '["300-579", "580-669", "670-739", "740-850"]', 3, 'Credit', 'Medium', 25),
('Budget Rule Quiz', 'In the 50/30/20 rule, what percentage goes to savings?', '["50%", "30%", "20%", "10%"]', 2, 'Budgeting', 'Easy', 15)
ON CONFLICT DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, category, requirement, reward_coins) VALUES
('First Lesson', 'Complete your first lesson', 'award', 'lessons', '{"count": 1}', 50),
('Quiz Master', 'Answer 5 quizzes correctly', 'brain', 'quizzes', '{"count": 5}', 100),
('3-Day Streak', 'Maintain a 3-day learning streak', 'flame', 'streak', '{"days": 3}', 75),
('Budgeting Pro', 'Complete 3 budgeting lessons', 'piggy-bank', 'lessons', '{"count": 3, "category": "Budgeting"}', 150),
('Early Investor', 'Earn your first 100 Dough Coins', 'trending-up', 'coins', '{"amount": 100}', 25)
ON CONFLICT DO NOTHING;