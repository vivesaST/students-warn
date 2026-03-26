
-- Enums
CREATE TYPE public.app_role AS ENUM ('instructor', 'student');
CREATE TYPE public.risk_level AS ENUM ('high', 'moderate', 'low');
CREATE TYPE public.recommendation_priority AS ENUM ('high', 'medium', 'low');

-- update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  instructor_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view courses" ON public.courses FOR SELECT TO authenticated USING (true);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  role public.app_role NOT NULL DEFAULT 'student',
  github_username TEXT,
  github_url TEXT,
  course_id UUID REFERENCES public.courses(id),
  last_commit_date DATE,
  total_commits INTEGER DEFAULT 0,
  commits_this_week INTEGER DEFAULT 0,
  enrolled_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Security definer helpers to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_course_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT course_id FROM public.profiles WHERE id = _user_id;
$$;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Instructors can view course profiles" ON public.profiles FOR SELECT TO authenticated USING (
  public.get_user_role(auth.uid()) = 'instructor' AND course_id = public.get_user_course_id(auth.uid())
);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Student features table
CREATE TABLE public.student_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id),
  commit_frequency_per_day NUMERIC,
  commit_frequency_per_week NUMERIC,
  commit_regularity_score NUMERIC,
  total_commits INTEGER,
  avg_commit_size_lines_changed NUMERIC,
  code_churn_ratio NUMERIC,
  branch_count INTEGER,
  merge_frequency NUMERIC,
  issue_creation_rate NUMERIC,
  issue_resolution_time NUMERIC,
  days_since_last_commit INTEGER,
  commits_last_3_days INTEGER,
  commits_last_week INTEGER,
  files_modified_count INTEGER,
  commit_message_quality_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);
ALTER TABLE public.student_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own features" ON public.student_features FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Instructors view course features" ON public.student_features FOR SELECT TO authenticated USING (
  public.get_user_role(auth.uid()) = 'instructor' AND course_id = public.get_user_course_id(auth.uid())
);
CREATE POLICY "Service insert features" ON public.student_features FOR INSERT TO authenticated WITH CHECK (true);

-- Risk assessments table
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL,
  risk_level public.risk_level NOT NULL,
  assessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own assessments" ON public.risk_assessments FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Instructors view course assessments" ON public.risk_assessments FOR SELECT TO authenticated USING (
  public.get_user_role(auth.uid()) = 'instructor'
);
CREATE POLICY "Service insert assessments" ON public.risk_assessments FOR INSERT TO authenticated WITH CHECK (true);

-- Weekly risk history table
CREATE TABLE public.weekly_risk_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_label TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  assessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.weekly_risk_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own risk history" ON public.weekly_risk_history FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Instructors view all risk history" ON public.weekly_risk_history FOR SELECT TO authenticated USING (
  public.get_user_role(auth.uid()) = 'instructor'
);
CREATE POLICY "Service insert risk history" ON public.weekly_risk_history FOR INSERT TO authenticated WITH CHECK (true);

-- Daily commits table
CREATE TABLE public.daily_commits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  commit_date DATE NOT NULL,
  commit_count INTEGER DEFAULT 0,
  UNIQUE(student_id, commit_date)
);
ALTER TABLE public.daily_commits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own daily commits" ON public.daily_commits FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Instructors view all daily commits" ON public.daily_commits FOR SELECT TO authenticated USING (
  public.get_user_role(auth.uid()) = 'instructor'
);
CREATE POLICY "Service insert daily commits" ON public.daily_commits FOR INSERT TO authenticated WITH CHECK (true);

-- Weekly commits table
CREATE TABLE public.weekly_commits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_label TEXT NOT NULL,
  commits INTEGER DEFAULT 0,
  lines_added INTEGER DEFAULT 0,
  lines_deleted INTEGER DEFAULT 0,
  UNIQUE(student_id, week_label)
);
ALTER TABLE public.weekly_commits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own weekly commits" ON public.weekly_commits FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Instructors view all weekly commits" ON public.weekly_commits FOR SELECT TO authenticated USING (
  public.get_user_role(auth.uid()) = 'instructor'
);
CREATE POLICY "Service insert weekly commits" ON public.weekly_commits FOR INSERT TO authenticated WITH CHECK (true);

-- Recommendations table
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  priority public.recommendation_priority NOT NULL DEFAULT 'low',
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own recommendations" ON public.recommendations FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Instructors view all recommendations" ON public.recommendations FOR SELECT TO authenticated USING (
  public.get_user_role(auth.uid()) = 'instructor'
);
CREATE POLICY "Service insert recommendations" ON public.recommendations FOR INSERT TO authenticated WITH CHECK (true);

-- Class weekly commits table
CREATE TABLE public.class_weekly_commits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  week_label TEXT NOT NULL,
  commits INTEGER DEFAULT 0,
  lines_added INTEGER DEFAULT 0,
  lines_deleted INTEGER DEFAULT 0,
  UNIQUE(course_id, week_label)
);
ALTER TABLE public.class_weekly_commits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view class commits" ON public.class_weekly_commits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service insert class commits" ON public.class_weekly_commits FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX idx_profiles_course_id ON public.profiles(course_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_risk_assessments_student_id ON public.risk_assessments(student_id);
CREATE INDEX idx_weekly_risk_history_student_id ON public.weekly_risk_history(student_id);
CREATE INDEX idx_daily_commits_student_id ON public.daily_commits(student_id);
CREATE INDEX idx_weekly_commits_student_id ON public.weekly_commits(student_id);
CREATE INDEX idx_recommendations_student_id ON public.recommendations(student_id);
CREATE INDEX idx_student_features_student_id ON public.student_features(student_id);
