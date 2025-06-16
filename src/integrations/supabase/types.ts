export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      game_players: {
        Row: {
          game_room_id: string | null
          id: string
          is_connected: boolean | null
          joined_at: string | null
          player_name: string | null
          points: number | null
          position_x: number | null
          position_y: number | null
          role: Database["public"]["Enums"]["player_role"]
          user_id: string | null
        }
        Insert: {
          game_room_id?: string | null
          id?: string
          is_connected?: boolean | null
          joined_at?: string | null
          player_name?: string | null
          points?: number | null
          position_x?: number | null
          position_y?: number | null
          role: Database["public"]["Enums"]["player_role"]
          user_id?: string | null
        }
        Update: {
          game_room_id?: string | null
          id?: string
          is_connected?: boolean | null
          joined_at?: string | null
          player_name?: string | null
          points?: number | null
          position_x?: number | null
          position_y?: number | null
          role?: Database["public"]["Enums"]["player_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_room_id_fkey"
            columns: ["game_room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rooms: {
        Row: {
          code: string
          created_at: string | null
          current_turn: string | null
          game_state: Json | null
          guest_id: string | null
          host_id: string | null
          id: string
          settings: Json | null
          status: Database["public"]["Enums"]["game_status"] | null
          updated_at: string | null
          winner: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_turn?: string | null
          game_state?: Json | null
          guest_id?: string | null
          host_id?: string | null
          id?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["game_status"] | null
          updated_at?: string | null
          winner?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_turn?: string | null
          game_state?: Json | null
          guest_id?: string | null
          host_id?: string | null
          id?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["game_status"] | null
          updated_at?: string | null
          winner?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_game_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      game_status: "waiting" | "active" | "finished"
      player_role: "host" | "guest"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_status: ["waiting", "active", "finished"],
      player_role: ["host", "guest"],
    },
  },
} as const
