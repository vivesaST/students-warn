import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  role: "instructor" | "student";
  github_username: string | null;
  github_url: string | null;
  course_id: string | null;
  last_commit_date: string | null;
  total_commits: number;
  commits_this_week: number;
  enrolled_date: string | null;
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });
}
