
-- Allow service_role to delete recommendations for re-generation
CREATE POLICY "Service role delete recommendations"
ON public.recommendations
FOR DELETE
TO service_role
USING (true);

-- Allow service_role to update student_features
CREATE POLICY "Service role update features"
ON public.student_features
FOR UPDATE
TO service_role
USING (true);
