import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Context } from 'hono'
import type { Env } from './core-utils'
import type { Profile } from '@shared/types'
// This is a simplified database schema type.
// In a real project, you would generate this from your Supabase schema.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
// Remapping our Profile type to a Supabase Row type
export type ProfileRow = Omit<Profile, 'createdAt' | 'skills'> & {
    created_at: string;
    skills: Json;
};
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Partial<ProfileRow>
        Update: Partial<ProfileRow>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_top_skills: {
        Args: Record<string, unknown>
        Returns: {
          name: string
          count: number
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
let supabase: SupabaseClient<Database>;
export const getSupabase = (c: Context<{ Bindings: Env & { SUPABASE_URL: string; SUPABASE_ANON_KEY: string; } }>) => {
    if (supabase) {
        return supabase;
    }
    const supabaseUrl = c.env.SUPABASE_URL
    const supabaseAnonKey = c.env.SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL and Anon Key are required in environment bindings.')
    }
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    return supabase;
}