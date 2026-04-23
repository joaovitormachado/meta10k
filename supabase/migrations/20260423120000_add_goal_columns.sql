-- Add goal personalization columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS goal_name TEXT,
ADD COLUMN IF NOT EXISTS goal_image TEXT;

-- Update handle_new_user function to include goal fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, goal_name, goal_image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NULL,
    NULL
  );
  RETURN NEW;
END;
$$;