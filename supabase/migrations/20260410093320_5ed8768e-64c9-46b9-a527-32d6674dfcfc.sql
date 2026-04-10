
-- Update handle_new_user to support role-specific signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
  _course_id uuid;
  _course_name text;
  _join_course_id uuid;
BEGIN
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student');
  
  IF _role = 'instructor' THEN
    _course_name := COALESCE(NEW.raw_user_meta_data->>'course_name', 'Untitled Course');
    INSERT INTO public.courses (name, instructor_name)
    VALUES (_course_name, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
    RETURNING id INTO _course_id;
  ELSE
    _join_course_id := (NEW.raw_user_meta_data->>'course_id')::uuid;
    IF _join_course_id IS NOT NULL THEN
      _course_id := _join_course_id;
    END IF;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, course_id, enrolled_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    _role,
    _course_id,
    CASE WHEN _role = 'student' THEN CURRENT_DATE ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    course_id = COALESCE(EXCLUDED.course_id, profiles.course_id),
    enrolled_date = COALESCE(EXCLUDED.enrolled_date, profiles.enrolled_date);

  RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow anon users to view courses (for signup dropdown)
CREATE POLICY "Anon can view courses" ON public.courses
  FOR SELECT TO anon USING (true);
