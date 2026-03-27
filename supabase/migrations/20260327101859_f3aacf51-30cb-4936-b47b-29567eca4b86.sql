
-- Add unique constraints for upsert support in the sync edge function
ALTER TABLE public.daily_commits ADD CONSTRAINT daily_commits_student_date_unique UNIQUE (student_id, commit_date);
ALTER TABLE public.weekly_commits ADD CONSTRAINT weekly_commits_student_week_unique UNIQUE (student_id, week_label);
ALTER TABLE public.class_weekly_commits ADD CONSTRAINT class_weekly_commits_course_week_unique UNIQUE (course_id, week_label);

-- Allow service_role to update/delete these tables (for upserts during sync)
-- service_role bypasses RLS, so we just need the policies for student_features upsert
-- student_features already has a unique constraint on student_id (isOneToOne: true)

-- Enable pg_net extension for cron HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
