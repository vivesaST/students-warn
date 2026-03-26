export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      class_weekly_commits: {
        Row: {
          commits: number | null
          course_id: string
          id: string
          lines_added: number | null
          lines_deleted: number | null
          week_label: string
        }
        Insert: {
          commits?: number | null
          course_id: string
          id?: string
          lines_added?: number | null
          lines_deleted?: number | null
          week_label: string
        }
        Update: {
          commits?: number | null
          course_id?: string
          id?: string
          lines_added?: number | null
          lines_deleted?: number | null
          week_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_weekly_commits_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          instructor_name: string
          name: string
          start_date: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          instructor_name: string
          name: string
          start_date?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          instructor_name?: string
          name?: string
          start_date?: string | null
        }
        Relationships: []
      }
      daily_commits: {
        Row: {
          commit_count: number | null
          commit_date: string
          id: string
          student_id: string
        }
        Insert: {
          commit_count?: number | null
          commit_date: string
          id?: string
          student_id: string
        }
        Update: {
          commit_count?: number | null
          commit_date?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_commits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          commits_this_week: number | null
          course_id: string | null
          created_at: string
          email: string | null
          enrolled_date: string | null
          full_name: string
          github_url: string | null
          github_username: string | null
          id: string
          last_commit_date: string | null
          role: Database["public"]["Enums"]["app_role"]
          total_commits: number | null
          updated_at: string
        }
        Insert: {
          commits_this_week?: number | null
          course_id?: string | null
          created_at?: string
          email?: string | null
          enrolled_date?: string | null
          full_name: string
          github_url?: string | null
          github_username?: string | null
          id: string
          last_commit_date?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          total_commits?: number | null
          updated_at?: string
        }
        Update: {
          commits_this_week?: number | null
          course_id?: string | null
          created_at?: string
          email?: string | null
          enrolled_date?: string | null
          full_name?: string
          github_url?: string | null
          github_username?: string | null
          id?: string
          last_commit_date?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          total_commits?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          priority: Database["public"]["Enums"]["recommendation_priority"]
          student_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["recommendation_priority"]
          student_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["recommendation_priority"]
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          assessed_at: string
          created_at: string
          id: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score: number
          student_id: string
        }
        Insert: {
          assessed_at?: string
          created_at?: string
          id?: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score: number
          student_id: string
        }
        Update: {
          assessed_at?: string
          created_at?: string
          id?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          risk_score?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_features: {
        Row: {
          avg_commit_size_lines_changed: number | null
          branch_count: number | null
          code_churn_ratio: number | null
          commit_frequency_per_day: number | null
          commit_frequency_per_week: number | null
          commit_message_quality_score: number | null
          commit_regularity_score: number | null
          commits_last_3_days: number | null
          commits_last_week: number | null
          course_id: string | null
          created_at: string
          days_since_last_commit: number | null
          files_modified_count: number | null
          id: string
          issue_creation_rate: number | null
          issue_resolution_time: number | null
          merge_frequency: number | null
          student_id: string
          total_commits: number | null
        }
        Insert: {
          avg_commit_size_lines_changed?: number | null
          branch_count?: number | null
          code_churn_ratio?: number | null
          commit_frequency_per_day?: number | null
          commit_frequency_per_week?: number | null
          commit_message_quality_score?: number | null
          commit_regularity_score?: number | null
          commits_last_3_days?: number | null
          commits_last_week?: number | null
          course_id?: string | null
          created_at?: string
          days_since_last_commit?: number | null
          files_modified_count?: number | null
          id?: string
          issue_creation_rate?: number | null
          issue_resolution_time?: number | null
          merge_frequency?: number | null
          student_id: string
          total_commits?: number | null
        }
        Update: {
          avg_commit_size_lines_changed?: number | null
          branch_count?: number | null
          code_churn_ratio?: number | null
          commit_frequency_per_day?: number | null
          commit_frequency_per_week?: number | null
          commit_message_quality_score?: number | null
          commit_regularity_score?: number | null
          commits_last_3_days?: number | null
          commits_last_week?: number | null
          course_id?: string | null
          created_at?: string
          days_since_last_commit?: number | null
          files_modified_count?: number | null
          id?: string
          issue_creation_rate?: number | null
          issue_resolution_time?: number | null
          merge_frequency?: number | null
          student_id?: string
          total_commits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_features_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_features_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_commits: {
        Row: {
          commits: number | null
          id: string
          lines_added: number | null
          lines_deleted: number | null
          student_id: string
          week_label: string
        }
        Insert: {
          commits?: number | null
          id?: string
          lines_added?: number | null
          lines_deleted?: number | null
          student_id: string
          week_label: string
        }
        Update: {
          commits?: number | null
          id?: string
          lines_added?: number | null
          lines_deleted?: number | null
          student_id?: string
          week_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_commits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_risk_history: {
        Row: {
          assessed_at: string
          id: string
          risk_score: number
          student_id: string
          week_label: string
        }
        Insert: {
          assessed_at?: string
          id?: string
          risk_score: number
          student_id: string
          week_label: string
        }
        Update: {
          assessed_at?: string
          id?: string
          risk_score?: number
          student_id?: string
          week_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_risk_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_course_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "instructor" | "student"
      recommendation_priority: "high" | "medium" | "low"
      risk_level: "high" | "moderate" | "low"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["instructor", "student"],
      recommendation_priority: ["high", "medium", "low"],
      risk_level: ["high", "moderate", "low"],
    },
  },
} as const
