
-- Fix overly permissive INSERT policies - restrict to service_role only
-- Drop the permissive WITH CHECK (true) insert policies
DROP POLICY IF EXISTS "Service insert features" ON public.student_features;
DROP POLICY IF EXISTS "Service insert assessments" ON public.risk_assessments;
DROP POLICY IF EXISTS "Service insert risk history" ON public.weekly_risk_history;
DROP POLICY IF EXISTS "Service insert daily commits" ON public.daily_commits;
DROP POLICY IF EXISTS "Service insert weekly commits" ON public.weekly_commits;
DROP POLICY IF EXISTS "Service insert recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Service insert class commits" ON public.class_weekly_commits;

-- Re-create as service_role only (seeding edge function uses service role key)
CREATE POLICY "Service role insert features" ON public.student_features FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role insert assessments" ON public.risk_assessments FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role insert risk history" ON public.weekly_risk_history FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role insert daily commits" ON public.daily_commits FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role insert weekly commits" ON public.weekly_commits FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role insert recommendations" ON public.recommendations FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role insert class commits" ON public.class_weekly_commits FOR INSERT TO service_role WITH CHECK (true);

-- Also drop profiles insert (service role handles seeding)
-- Keep the authenticated user INSERT for self-signup
-- Add a service_role insert as well for profiles
CREATE POLICY "Service role insert profiles" ON public.profiles FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role insert courses" ON public.courses FOR INSERT TO service_role WITH CHECK (true);
