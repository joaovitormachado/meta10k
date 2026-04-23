-- Add goal personalization columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS goal_target_value NUMERIC,
ADD COLUMN IF NOT EXISTS goal_image_url TEXT,
ADD COLUMN IF NOT EXISTS goal_type TEXT;

-- Migration to ensure goal_name is also there (should be from previous migration but just in case)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS goal_name TEXT;

-- Update handle_new_user function to include all goal fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, goal_name, goal_target_value, goal_image_url, goal_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NULL,
    NULL,
    NULL,
    NULL
  );
  RETURN NEW;
END;
$$;
