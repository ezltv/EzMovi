export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      playlists: {
        Row: {
          id: number
          user_id: string
          name: string | null
          url: string
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name?: string | null
          url: string
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string | null
          url?: string
          is_active?: boolean | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          channel_name: string
          channel_url: string
          channel_logo: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          channel_name: string
          channel_url: string
          channel_logo?: string | null
          category?: string | null
          created_at?: string
        }
      }
    }
  }
}