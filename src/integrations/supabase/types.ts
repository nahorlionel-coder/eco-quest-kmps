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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      department_challenges: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          icon: string | null
          id: string
          reward_description: string | null
          start_date: string
          status: string
          target_points: number
          team_a: string
          team_a_points: number
          team_b: string
          team_b_points: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string
          icon?: string | null
          id?: string
          reward_description?: string | null
          start_date?: string
          status?: string
          target_points?: number
          team_a: string
          team_a_points?: number
          team_b: string
          team_b_points?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          icon?: string | null
          id?: string
          reward_description?: string | null
          start_date?: string
          status?: string
          target_points?: number
          team_a?: string
          team_a_points?: number
          team_b?: string
          team_b_points?: number
          title?: string
        }
        Relationships: []
      }
      mission_completions: {
        Row: {
          ai_confidence: number | null
          ai_result: string | null
          completed_at: string
          completion_date: string
          id: string
          mission_id: string
          mission_title: string | null
          photo_url: string | null
          points_earned: number
          qr_code: string | null
          reviewed_at: string | null
          status: string
          user_id: string
          week_start: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_result?: string | null
          completed_at?: string
          completion_date?: string
          id?: string
          mission_id: string
          mission_title?: string | null
          photo_url?: string | null
          points_earned?: number
          qr_code?: string | null
          reviewed_at?: string | null
          status?: string
          user_id: string
          week_start?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_result?: string | null
          completed_at?: string
          completion_date?: string
          id?: string
          mission_id?: string
          mission_title?: string | null
          photo_url?: string | null
          points_earned?: number
          qr_code?: string | null
          reviewed_at?: string | null
          status?: string
          user_id?: string
          week_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_completions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          difficulty: string
          frequency: string
          icon: string | null
          id: string
          is_bonus: boolean
          is_sponsored: boolean
          points: number
          redirect_url: string | null
          sort_order: number
          sponsor_name: string | null
          title: string
          type: string
          unlock_level: number
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          frequency?: string
          icon?: string | null
          id?: string
          is_bonus?: boolean
          is_sponsored?: boolean
          points?: number
          redirect_url?: string | null
          sort_order?: number
          sponsor_name?: string | null
          title: string
          type?: string
          unlock_level?: number
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          frequency?: string
          icon?: string | null
          id?: string
          is_bonus?: boolean
          is_sponsored?: boolean
          points?: number
          redirect_url?: string | null
          sort_order?: number
          sponsor_name?: string | null
          title?: string
          type?: string
          unlock_level?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          id: string
          level: number
          points: number
          streak: number
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          level?: number
          points?: number
          streak?: number
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          level?: number
          points?: number
          streak?: number
          user_id?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          created_at: string
          id: string
          points_spent: number
          reward_id: string
          reward_title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_spent?: number
          reward_id: string
          reward_title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_spent?: number
          reward_id?: string
          reward_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          available: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          image: string | null
          is_sponsored: boolean
          points_cost: number
          sponsor_name: string | null
          title: string
        }
        Insert: {
          available?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          is_sponsored?: boolean
          points_cost?: number
          sponsor_name?: string | null
          title: string
        }
        Update: {
          available?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          is_sponsored?: boolean
          points_cost?: number
          sponsor_name?: string | null
          title?: string
        }
        Relationships: []
      }
      user_mission_assignments: {
        Row: {
          created_at: string
          id: string
          is_bonus: boolean
          mission_id: string
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_bonus?: boolean
          mission_id: string
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_bonus?: boolean
          mission_id?: string
          period_end?: string
          period_start?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_reward: {
        Args: {
          _points_cost: number
          _reward_id: string
          _reward_title: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
