-- Add foreign key relationship between posts and profiles
-- First, we need to ensure all posts have a corresponding profile
-- This will create profiles for users who don't have them yet
INSERT INTO public.profiles (user_id, username, full_name)
SELECT 
  id,
  email,
  email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Now add the foreign key constraint from posts to profiles
-- We need to drop the existing constraint and recreate it properly
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Add the constraint to link posts to profiles instead of auth.users
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;