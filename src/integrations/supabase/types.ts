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
      categories: {
        Row: {
          icon: string
          id: string
          name: string
        }
        Insert: {
          icon: string
          id?: string
          name: string
        }
        Update: {
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      channels: {
        Row: {
          category: string
          country: string
          external_links: Json | null
          id: string
          is_favorite: boolean | null
          last_watched: string | null
          logo: string
          name: string
          stream_url: string
        }
        Insert: {
          category: string
          country: string
          external_links?: Json | null
          id?: string
          is_favorite?: boolean | null
          last_watched?: string | null
          logo: string
          name: string
          stream_url: string
        }
        Update: {
          category?: string
          country?: string
          external_links?: Json | null
          id?: string
          is_favorite?: boolean | null
          last_watched?: string | null
          logo?: string
          name?: string
          stream_url?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          flag: string
          id: string
          image: string
          name: string
        }
        Insert: {
          flag: string
          id?: string
          image: string
          name: string
        }
        Update: {
          flag?: string
          id?: string
          image?: string
          name?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          default_layout: string
          featured_channels_limit: number
          hide_empty_categories: boolean
          id: string
          language: string
          logo: string
          recently_watched_limit: number
          show_categories_on_home: boolean
          show_countries_on_home: boolean
          show_featured_channels_on_home: boolean
          show_recently_watched_on_home: boolean
          site_name: string
          theme: string
        }
        Insert: {
          default_layout: string
          featured_channels_limit?: number
          hide_empty_categories?: boolean
          id: string
          language?: string
          logo: string
          recently_watched_limit?: number
          show_categories_on_home?: boolean
          show_countries_on_home?: boolean
          show_featured_channels_on_home?: boolean
          show_recently_watched_on_home?: boolean
          site_name: string
          theme: string
        }
        Update: {
          default_layout?: string
          featured_channels_limit?: number
          hide_empty_categories?: boolean
          id?: string
          language?: string
          logo?: string
          recently_watched_limit?: number
          show_categories_on_home?: boolean
          show_countries_on_home?: boolean
          show_featured_channels_on_home?: boolean
          show_recently_watched_on_home?: boolean
          site_name?: string
          theme?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
