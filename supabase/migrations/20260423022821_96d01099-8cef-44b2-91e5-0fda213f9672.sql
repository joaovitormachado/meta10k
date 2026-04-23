-- =========================
-- GOALS
-- =========================
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_total NUMERIC NOT NULL DEFAULT 10000,
  goal_monthly NUMERIC NOT NULL DEFAULT 500,
  amount_saved NUMERIC NOT NULL DEFAULT 0,
  amount_remaining NUMERIC NOT NULL DEFAULT 10000,
  progress_percent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal" ON public.goals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goal" ON public.goals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goal" ON public.goals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goal" ON public.goals
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- CONTRIBUTIONS
-- =========================
CREATE TYPE public.contribution_source AS ENUM ('salary', 'extra_income', 'sale', 'other');

CREATE TABLE public.contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  source public.contribution_source NOT NULL DEFAULT 'other',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contributions_user_date ON public.contributions(user_id, date DESC);

ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contributions" ON public.contributions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contributions" ON public.contributions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contributions" ON public.contributions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contributions" ON public.contributions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================
-- WEEKLY CHECKLISTS
-- =========================
CREATE TABLE public.weekly_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_reference DATE NOT NULL,
  saved_money BOOLEAN NOT NULL DEFAULT false,
  extra_income BOOLEAN NOT NULL DEFAULT false,
  avoided_unnecessary_expense BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_reference)
);

ALTER TABLE public.weekly_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklists" ON public.weekly_checklists
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklists" ON public.weekly_checklists
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklists" ON public.weekly_checklists
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklists" ON public.weekly_checklists
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_weekly_checklists_updated_at
  BEFORE UPDATE ON public.weekly_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- DAILY ACTIONS
-- =========================
CREATE TABLE public.daily_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_actions_user_created ON public.daily_actions(user_id, created_at DESC);

ALTER TABLE public.daily_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions" ON public.daily_actions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own actions" ON public.daily_actions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own actions" ON public.daily_actions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own actions" ON public.daily_actions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================
-- AUTO-CREATE GOAL ON SIGNUP
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );

  INSERT INTO public.goals (user_id, goal_total, goal_monthly, amount_saved, amount_remaining, progress_percent)
  VALUES (NEW.id, 10000, 500, 0, 10000, 0);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill goals for any existing users without one
INSERT INTO public.goals (user_id, goal_total, goal_monthly, amount_saved, amount_remaining, progress_percent)
SELECT u.id, 10000, 500, 0, 10000, 0
FROM auth.users u
LEFT JOIN public.goals g ON g.user_id = u.id
WHERE g.id IS NULL;