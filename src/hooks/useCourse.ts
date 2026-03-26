import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Course } from "@/data/mockData";

export function useCourse(courseId: string | null | undefined) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async (): Promise<Course | null> => {
      if (!courseId) return null;
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        instructorName: data.instructor_name,
        startDate: data.start_date ?? "",
        endDate: data.end_date ?? "",
        totalStudents: 0,
      };
    },
    enabled: !!courseId,
  });
}
