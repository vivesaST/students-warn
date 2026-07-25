CREATE OR REPLACE FUNCTION public.owns_course(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses
    WHERE id = _course_id AND created_by = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_my_student(_instructor_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.courses c ON c.id = p.course_id
    WHERE p.id = _student_id AND c.created_by = _instructor_id
  );
$$;

DROP POLICY IF EXISTS "Instructors can view course profiles" ON public.profiles;
CREATE POLICY "Instructors can view own course profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.owns_course(auth.uid(), course_id));

DROP POLICY IF EXISTS "Instructors view course features" ON public.student_features;
CREATE POLICY "Instructors view own course features"
ON public.student_features FOR SELECT TO authenticated
USING (public.is_my_student(auth.uid(), student_id));

DROP POLICY IF EXISTS "Instructors view all daily commits" ON public.daily_commits;
CREATE POLICY "Instructors view own course daily commits"
ON public.daily_commits FOR SELECT TO authenticated
USING (public.is_my_student(auth.uid(), student_id));

DROP POLICY IF EXISTS "Instructors view all weekly commits" ON public.weekly_commits;
CREATE POLICY "Instructors view own course weekly commits"
ON public.weekly_commits FOR SELECT TO authenticated
USING (public.is_my_student(auth.uid(), student_id));

DROP POLICY IF EXISTS "Instructors view course assessments" ON public.risk_assessments;
CREATE POLICY "Instructors view own course assessments"
ON public.risk_assessments FOR SELECT TO authenticated
USING (public.is_my_student(auth.uid(), student_id));

DROP POLICY IF EXISTS "Instructors view all risk history" ON public.weekly_risk_history;
CREATE POLICY "Instructors view own course risk history"
ON public.weekly_risk_history FOR SELECT TO authenticated
USING (public.is_my_student(auth.uid(), student_id));

DROP POLICY IF EXISTS "Instructors view all recommendations" ON public.recommendations;
CREATE POLICY "Instructors view own course recommendations"
ON public.recommendations FOR SELECT TO authenticated
USING (public.is_my_student(auth.uid(), student_id));