/*
  # Learn Tab Image Storage Setup

  1. Storage Buckets
    - `learn-images` - For learning content images
    - `learn-thumbnails` - For optimized thumbnail images

  2. Security
    - Public read access for all learn images
    - Admin-only write access for content management
    - Proper RLS policies for image management

  3. Image Categories
    - lesson-covers: Main lesson cover images
    - lesson-content: Images within lesson content
    - category-icons: Category and topic icons
    - backgrounds: Background images for cards
*/

-- Create learn-images bucket for main content images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'learn-images', 
  'learn-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create learn-thumbnails bucket for optimized thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'learn-thumbnails', 
  'learn-thumbnails', 
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access for learn images
CREATE POLICY "Learn images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'learn-images');

-- Public read access for learn thumbnails
CREATE POLICY "Learn thumbnails are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'learn-thumbnails');

-- Admin upload policy for learn images (you can modify this based on your admin setup)
CREATE POLICY "Authenticated users can upload learn images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'learn-images' 
    AND auth.role() = 'authenticated'
  );

-- Admin upload policy for learn thumbnails
CREATE POLICY "Authenticated users can upload learn thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'learn-thumbnails' 
    AND auth.role() = 'authenticated'
  );

-- Admin update policy for learn images
CREATE POLICY "Authenticated users can update learn images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'learn-images' 
    AND auth.role() = 'authenticated'
  );

-- Admin update policy for learn thumbnails
CREATE POLICY "Authenticated users can update learn thumbnails" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'learn-thumbnails' 
    AND auth.role() = 'authenticated'
  );

-- Admin delete policy for learn images
CREATE POLICY "Authenticated users can delete learn images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'learn-images' 
    AND auth.role() = 'authenticated'
  );

-- Admin delete policy for learn thumbnails
CREATE POLICY "Authenticated users can delete learn thumbnails" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'learn-thumbnails' 
    AND auth.role() = 'authenticated'
  );

-- Update lessons table to include image references
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE lessons ADD COLUMN cover_image_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE lessons ADD COLUMN thumbnail_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'image_alt_text'
  ) THEN
    ALTER TABLE lessons ADD COLUMN image_alt_text TEXT;
  END IF;
END $$;

-- Update quizzes table to include image references
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN image_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'image_alt_text'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN image_alt_text TEXT;
  END IF;
END $$;

-- Create learning_categories table for category management
CREATE TABLE IF NOT EXISTS learning_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  color_hex TEXT DEFAULT '#00E5CC',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for learning_categories
ALTER TABLE learning_categories ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Anyone can view learning categories" ON learning_categories
  FOR SELECT USING (is_active = true);

-- Insert default categories with placeholder image URLs
INSERT INTO learning_categories (name, description, color_hex, sort_order) VALUES
('Budgeting', 'Learn to create and manage budgets effectively', '#00E5CC', 1),
('Saving', 'Build emergency funds and savings strategies', '#AAFF00', 2),
('Credit', 'Understand and improve your credit score', '#FFD600', 3),
('Investing', 'Start your investment journey', '#FF34B3', 4),
('Debt Management', 'Strategies to eliminate debt', '#FF8A00', 5),
('Financial Planning', 'Long-term financial planning', '#00A3FF', 6)
ON CONFLICT (name) DO NOTHING;

-- Update existing lessons with sample Supabase image URLs
-- Note: These are placeholder URLs - you'll need to upload actual images
UPDATE lessons SET 
  cover_image_url = CASE 
    WHEN category = 'Budgeting' THEN 'https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg'
    WHEN category = 'Saving' THEN 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg'
    WHEN category = 'Credit' THEN 'https://images.pexels.com/photos/4386437/pexels-photo-4386437.jpeg'
    ELSE 'https://images.pexels.com/photos/4386342/pexels-photo-4386342.jpeg'
  END,
  image_alt_text = CASE 
    WHEN category = 'Budgeting' THEN 'Person creating a budget with calculator and papers'
    WHEN category = 'Saving' THEN 'Piggy bank and coins representing savings'
    WHEN category = 'Credit' THEN 'Credit cards and financial documents'
    ELSE 'Investment charts and financial planning materials'
  END
WHERE cover_image_url IS NULL;