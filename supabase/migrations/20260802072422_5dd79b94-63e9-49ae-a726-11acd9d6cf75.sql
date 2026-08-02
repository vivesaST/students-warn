CREATE POLICY "Instructors can update own course student profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.owns_course(auth.uid(), course_id))
WITH CHECK (public.owns_course(auth.uid(), course_id));