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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  coderdojo: {
    Tables: {
      badge_categories: {
        Row: {
          category_description: string | null
          category_name: string | null
          deleted: boolean
          id: string
        }
        Insert: {
          category_description?: string | null
          category_name?: string | null
          deleted?: boolean
          id?: string
        }
        Update: {
          category_description?: string | null
          category_name?: string | null
          deleted?: boolean
          id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          achievement: string | null
          badge_category_id: string | null
          deleted: boolean
          description: string | null
          id: string
        }
        Insert: {
          achievement?: string | null
          badge_category_id?: string | null
          deleted?: boolean
          description?: string | null
          id?: string
        }
        Update: {
          achievement?: string | null
          badge_category_id?: string | null
          deleted?: boolean
          description?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_badge_category_id_fkey"
            columns: ["badge_category_id"]
            isOneToOne: false
            referencedRelation: "badge_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      belts: {
        Row: {
          color: string | null
          deleted: boolean
          description: string | null
          hex_code: string | null
          id: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          deleted?: boolean
          description?: string | null
          hex_code?: string | null
          id?: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          deleted?: boolean
          description?: string | null
          hex_code?: string | null
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      member_attendances: {
        Row: {
          date: string | null
          id: string
          member_id: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          member_id?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_attendances_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_badge_categories: {
        Row: {
          badge_category_id: string | null
          id: string
          member_id: string | null
        }
        Insert: {
          badge_category_id?: string | null
          id?: string
          member_id?: string | null
        }
        Update: {
          badge_category_id?: string | null
          id?: string
          member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_badge_categories_badge_category_id_fkey"
            columns: ["badge_category_id"]
            isOneToOne: false
            referencedRelation: "badge_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_badge_categories_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_badges: {
        Row: {
          application_date: string | null
          application_notes: string | null
          awarded: string | null
          awarded_by_adult_id: string | null
          awarded_notes: string | null
          badge_id: string | null
          goal_date: string | null
          id: string
          member_id: string | null
          rejected_by_adult_id: string | null
          rejected_date: string | null
          rejected_notes: string | null
        }
        Insert: {
          application_date?: string | null
          application_notes?: string | null
          awarded?: string | null
          awarded_by_adult_id?: string | null
          awarded_notes?: string | null
          badge_id?: string | null
          goal_date?: string | null
          id?: string
          member_id?: string | null
          rejected_by_adult_id?: string | null
          rejected_date?: string | null
          rejected_notes?: string | null
        }
        Update: {
          application_date?: string | null
          application_notes?: string | null
          awarded?: string | null
          awarded_by_adult_id?: string | null
          awarded_notes?: string | null
          badge_id?: string | null
          goal_date?: string | null
          id?: string
          member_id?: string | null
          rejected_by_adult_id?: string | null
          rejected_date?: string | null
          rejected_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_badges_awarded_by_adult_id_fkey"
            columns: ["awarded_by_adult_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_badges_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_badges_rejected_by_adult_id_fkey"
            columns: ["rejected_by_adult_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_belts: {
        Row: {
          application_date: string | null
          application_notes: string | null
          awarded: string | null
          awarded_by_adult_id: string | null
          awarded_notes: string | null
          belt_id: string | null
          id: string
          member_id: string | null
          rejected_by_adult_id: string | null
          rejected_date: string | null
          rejected_notes: string | null
        }
        Insert: {
          application_date?: string | null
          application_notes?: string | null
          awarded?: string | null
          awarded_by_adult_id?: string | null
          awarded_notes?: string | null
          belt_id?: string | null
          id?: string
          member_id?: string | null
          rejected_by_adult_id?: string | null
          rejected_date?: string | null
          rejected_notes?: string | null
        }
        Update: {
          application_date?: string | null
          application_notes?: string | null
          awarded?: string | null
          awarded_by_adult_id?: string | null
          awarded_notes?: string | null
          belt_id?: string | null
          id?: string
          member_id?: string | null
          rejected_by_adult_id?: string | null
          rejected_date?: string | null
          rejected_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_belts_awarded_by_adult_id_fkey"
            columns: ["awarded_by_adult_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_belts_belt_id_fkey"
            columns: ["belt_id"]
            isOneToOne: false
            referencedRelation: "belts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_belts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_belts_rejected_by_adult_id_fkey"
            columns: ["rejected_by_adult_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_parents: {
        Row: {
          id: string
          member_id: string | null
          parent_id: string | null
        }
        Insert: {
          id?: string
          member_id?: string | null
          parent_id?: string | null
        }
        Update: {
          id?: string
          member_id?: string | null
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_parents_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_parents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          birth_year: number | null
          deleted: boolean
          email: string | null
          fingerprint_id: number | null
          garda_vetted: boolean
          github_login: string | null
          goal_long_term: string | null
          goal_short_term: string | null
          has_avatar: boolean
          has_photo: boolean
          id: string
          is_mentor: boolean
          is_ninja: boolean
          is_parent: boolean
          login: string | null
          login_date: string | null
          login_date_previous: string | null
          name_first: string | null
          name_last: string | null
          password_hash: string | null
          phone: string | null
          registered_current_term: boolean
          scratch_name: string | null
          team_id: string | null
          xbox_gamertag: string | null
        }
        Insert: {
          birth_year?: number | null
          deleted?: boolean
          email?: string | null
          fingerprint_id?: number | null
          garda_vetted?: boolean
          github_login?: string | null
          goal_long_term?: string | null
          goal_short_term?: string | null
          has_avatar?: boolean
          has_photo?: boolean
          id?: string
          is_mentor?: boolean
          is_ninja?: boolean
          is_parent?: boolean
          login?: string | null
          login_date?: string | null
          login_date_previous?: string | null
          name_first?: string | null
          name_last?: string | null
          password_hash?: string | null
          phone?: string | null
          registered_current_term?: boolean
          scratch_name?: string | null
          team_id?: string | null
          xbox_gamertag?: string | null
        }
        Update: {
          birth_year?: number | null
          deleted?: boolean
          email?: string | null
          fingerprint_id?: number | null
          garda_vetted?: boolean
          github_login?: string | null
          goal_long_term?: string | null
          goal_short_term?: string | null
          has_avatar?: boolean
          has_photo?: boolean
          id?: string
          is_mentor?: boolean
          is_ninja?: boolean
          is_parent?: boolean
          login?: string | null
          login_date?: string | null
          login_date_previous?: string | null
          name_first?: string | null
          name_last?: string | null
          password_hash?: string | null
          phone?: string | null
          registered_current_term?: boolean
          scratch_name?: string | null
          team_id?: string | null
          xbox_gamertag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          id: string
          mentors_only: boolean
          session_date: string
          topic: string | null
        }
        Insert: {
          id?: string
          mentors_only?: boolean
          session_date: string
          topic?: string | null
        }
        Update: {
          id?: string
          mentors_only?: boolean
          session_date?: string
          topic?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          deleted: boolean
          goal: string | null
          hexcode: string | null
          id: string
          notes: string | null
          team_name: string
        }
        Insert: {
          deleted?: boolean
          goal?: string | null
          hexcode?: string | null
          id?: string
          notes?: string | null
          team_name: string
        }
        Update: {
          deleted?: boolean
          goal?: string | null
          hexcode?: string | null
          id?: string
          notes?: string | null
          team_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_attendance_dates: {
        Args: never
        Returns: {
          date: string
        }[]
      }
      get_attendance_stats: {
        Args: never
        Returns: {
          attendance_count: number
          date: string
        }[]
      }
      get_attendance_stats_split: {
        Args: never
        Returns: {
          date: string
          mentor_count: number
          ninja_count: number
          total_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  coderdojo: {
    Enums: {},
  },
} as const
