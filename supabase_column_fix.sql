-- ============================================================
-- SUPABASE COLUMN NAME FIX
-- Run this in your Supabase SQL Editor if your tables were 
-- created with camelCase column names (as in the original guide).
-- This renames them to snake_case to match the frontend code.
-- ============================================================

-- Fix user_profiles
ALTER TABLE public.userprofiles RENAME TO user_profiles;
ALTER TABLE public.user_profiles RENAME COLUMN fullname TO full_name;
ALTER TABLE public.user_profiles RENAME COLUMN avatarurl TO avatar_url;
ALTER TABLE public.user_profiles RENAME COLUMN createdat TO created_at;
ALTER TABLE public.user_profiles RENAME COLUMN updatedat TO updated_at;

-- Fix tasks
ALTER TABLE public.tasks RENAME COLUMN userid TO user_id;
ALTER TABLE public.tasks RENAME COLUMN duedate TO due_date;
ALTER TABLE public.tasks RENAME COLUMN isrecurring TO is_recurring;
ALTER TABLE public.tasks RENAME COLUMN recurrencepattern TO recurrence_pattern;
ALTER TABLE public.tasks RENAME COLUMN completedat TO completed_at;
ALTER TABLE public.tasks RENAME COLUMN createdat TO created_at;
ALTER TABLE public.tasks RENAME COLUMN updatedat TO updated_at;

-- Fix habits
ALTER TABLE public.habits RENAME COLUMN userid TO user_id;
ALTER TABLE public.habits RENAME COLUMN targetfrequency TO target_frequency;
ALTER TABLE public.habits RENAME COLUMN isactive TO is_active;
ALTER TABLE public.habits RENAME COLUMN createdat TO created_at;
ALTER TABLE public.habits RENAME COLUMN updatedat TO updated_at;

-- Fix habit_logs
ALTER TABLE public.habitlogs RENAME TO habit_logs;
ALTER TABLE public.habit_logs RENAME COLUMN habitid TO habit_id;
ALTER TABLE public.habit_logs RENAME COLUMN userid TO user_id;
ALTER TABLE public.habit_logs RENAME COLUMN completeddate TO completed_date;
ALTER TABLE public.habit_logs RENAME COLUMN createdat TO created_at;

-- Fix expenses
ALTER TABLE public.expenses RENAME COLUMN userid TO user_id;
ALTER TABLE public.expenses RENAME COLUMN expensedate TO expense_date;
ALTER TABLE public.expenses RENAME COLUMN paymentmethod TO payment_method;
ALTER TABLE public.expenses RENAME COLUMN createdat TO created_at;
ALTER TABLE public.expenses RENAME COLUMN updatedat TO updated_at;

-- Fix income
ALTER TABLE public.income RENAME COLUMN userid TO user_id;
ALTER TABLE public.income RENAME COLUMN incomedate TO income_date;
ALTER TABLE public.income RENAME COLUMN isrecurring TO is_recurring;
ALTER TABLE public.income RENAME COLUMN createdat TO created_at;
ALTER TABLE public.income RENAME COLUMN updatedat TO updated_at;

-- Fix goals
ALTER TABLE public.goals RENAME COLUMN userid TO user_id;
ALTER TABLE public.goals RENAME COLUMN targetdate TO target_date;
ALTER TABLE public.goals RENAME COLUMN createdat TO created_at;
ALTER TABLE public.goals RENAME COLUMN updatedat TO updated_at;

-- Fix goal_milestones
ALTER TABLE public.goalmilestones RENAME TO goal_milestones;
ALTER TABLE public.goal_milestones RENAME COLUMN goalid TO goal_id;
ALTER TABLE public.goal_milestones RENAME COLUMN userid TO user_id;
ALTER TABLE public.goal_milestones RENAME COLUMN iscompleted TO is_completed;
ALTER TABLE public.goal_milestones RENAME COLUMN completeddate TO completed_date;
ALTER TABLE public.goal_milestones RENAME COLUMN orderindex TO order_index;
ALTER TABLE public.goal_milestones RENAME COLUMN createdat TO created_at;
ALTER TABLE public.goal_milestones RENAME COLUMN updatedat TO updated_at;

-- Fix subscriptions
ALTER TABLE public.subscriptions RENAME COLUMN userid TO user_id;
ALTER TABLE public.subscriptions RENAME COLUMN billingcycle TO billing_cycle;
ALTER TABLE public.subscriptions RENAME COLUMN nextpaymentdate TO next_payment_date;
ALTER TABLE public.subscriptions RENAME COLUMN isactive TO is_active;
ALTER TABLE public.subscriptions RENAME COLUMN createdat TO created_at;
ALTER TABLE public.subscriptions RENAME COLUMN updatedat TO updated_at;

-- Fix journal_entries
ALTER TABLE public.journalentries RENAME TO journal_entries;
ALTER TABLE public.journal_entries RENAME COLUMN userid TO user_id;
ALTER TABLE public.journal_entries RENAME COLUMN entrydate TO entry_date;
ALTER TABLE public.journal_entries RENAME COLUMN createdat TO created_at;
ALTER TABLE public.journal_entries RENAME COLUMN updatedat TO updated_at;

-- Fix insights
ALTER TABLE public.insights RENAME COLUMN userid TO user_id;
ALTER TABLE public.insights RENAME COLUMN isread TO is_read;
ALTER TABLE public.insights RENAME COLUMN createdat TO created_at;

-- ============================================================
-- UPDATE RLS POLICIES (re-create them with new column names)
-- ============================================================

-- Drop and recreate tasks policies
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;

CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Recreate policies for all tables
DROP POLICY IF EXISTS "Users can manage own habits" ON public.habits;
CREATE POLICY "Users can manage own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own habit logs" ON public.habit_logs;
CREATE POLICY "Users can manage own habit logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own expenses" ON public.expenses;
CREATE POLICY "Users can manage own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own income" ON public.income;
CREATE POLICY "Users can manage own income" ON public.income FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own goals" ON public.goals;
CREATE POLICY "Users can manage own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own milestones" ON public.goal_milestones;
CREATE POLICY "Users can manage own milestones" ON public.goal_milestones FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own journal" ON public.journal_entries;
CREATE POLICY "Users can manage own journal" ON public.journal_entries FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own insights" ON public.insights;
CREATE POLICY "Users can manage own insights" ON public.insights FOR ALL USING (auth.uid() = user_id);

-- Fix user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- FIX TRIGGER FUNCTION (new column names)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
