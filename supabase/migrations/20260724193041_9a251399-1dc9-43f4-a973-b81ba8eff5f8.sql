ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE POLICY "Instructors create own courses" ON public.courses
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.get_user_role(auth.uid()) = 'instructor');

CREATE POLICY "Instructors update own courses" ON public.courses
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Instructors delete own courses" ON public.courses
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

GRANT INSERT, UPDATE, DELETE ON public.courses TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
  _course_id uuid;
  _course_name text;
  _join_course_id uuid;
BEGIN
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student');

  IF _role = 'instructor' THEN
    _course_name := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'course_name', '')), '');
    IF _course_name IS NOT NULL THEN
      INSERT INTO public.courses (name, instructor_name, created_by)
      VALUES (_course_name, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), NEW.id)
      RETURNING id INTO _course_id;
    END IF;
  ELSE
    _join_course_id := NULLIF(NEW.raw_user_meta_data->>'course_id', '')::uuid;
    IF _join_course_id IS NOT NULL THEN
      _course_id := _join_course_id;
    END IF;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, course_id, enrolled_date, github_username, github_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    _role,
    _course_id,
    CASE WHEN _role = 'student' THEN CURRENT_DATE ELSE NULL END,
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'github_username', '')), ''),
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'github_url', '')), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    course_id = COALESCE(EXCLUDED.course_id, profiles.course_id),
    enrolled_date = COALESCE(EXCLUDED.enrolled_date, profiles.enrolled_date),
    github_username = COALESCE(EXCLUDED.github_username, profiles.github_username),
    github_url = COALESCE(EXCLUDED.github_url, profiles.github_url);

  RETURN NEW;
END;
$function$;