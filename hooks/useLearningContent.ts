import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { imageService } from '@/lib/imageService';

export interface LearningLesson {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: any;
  cover_image_url: string | null;
  thumbnail_url: string | null;
  image_alt_text: string | null;
  belt_required: string;
  order_index: number;
  estimated_time: number;
  created_at: string;
  updated_at: string;
}

export interface LearningQuiz {
  id: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: number;
  category: string;
  difficulty: string;
  reward: number;
  image_url: string | null;
  image_alt_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningCategory {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  color_hex: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useLearningContent() {
  const [lessons, setLessons] = useState<LearningLesson[]>([]);
  const [quizzes, setQuizzes] = useState<LearningQuiz[]>([]);
  const [categories, setCategories] = useState<LearningCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLearningContent();
  }, []);

  const fetchLearningContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lessons with images
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;

      // Fetch quizzes with images
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (quizzesError) throw quizzesError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('learning_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Process lessons to ensure image URLs
      const processedLessons = lessonsData?.map(lesson => ({
        ...lesson,
        cover_image_url: lesson.cover_image_url || imageService.getFallbackImage('lesson'),
        thumbnail_url: lesson.thumbnail_url || lesson.cover_image_url || imageService.getFallbackImage('lesson'),
        estimated_time: lesson.estimated_time || 15
      })) || [];

      // Process quizzes to ensure image URLs
      const processedQuizzes = quizzesData?.map(quiz => ({
        ...quiz,
        image_url: quiz.image_url || imageService.getFallbackImage('quiz')
      })) || [];

      setLessons(processedLessons);
      setQuizzes(processedQuizzes);
      setCategories(categoriesData || []);

      // Preload critical images
      const imagesToPreload = [
        ...processedLessons.slice(0, 5).map(lesson => lesson.cover_image_url).filter(Boolean),
        ...processedQuizzes.slice(0, 3).map(quiz => quiz.image_url).filter(Boolean)
      ] as string[];

      if (imagesToPreload.length > 0) {
        imageService.preloadImages(imagesToPreload).catch(console.warn);
      }

    } catch (err: any) {
      console.error('Error fetching learning content:', err);
      setError(err.message || 'Failed to load learning content');
    } finally {
      setLoading(false);
    }
  };

  const getLessonsByCategory = (category: string) => {
    return lessons.filter(lesson => lesson.category.toLowerCase() === category.toLowerCase());
  };

  const getQuizzesByCategory = (category: string) => {
    return quizzes.filter(quiz => quiz.category.toLowerCase() === category.toLowerCase());
  };

  const getLessonsByDifficulty = (difficulty: string) => {
    return lessons.filter(lesson => lesson.difficulty === difficulty);
  };

  const searchLessons = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return lessons.filter(lesson => 
      lesson.title.toLowerCase().includes(lowercaseQuery) ||
      lesson.description.toLowerCase().includes(lowercaseQuery) ||
      lesson.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const refreshContent = () => {
    fetchLearningContent();
  };

  return {
    lessons,
    quizzes,
    categories,
    loading,
    error,
    getLessonsByCategory,
    getQuizzesByCategory,
    getLessonsByDifficulty,
    searchLessons,
    refreshContent
  };
}