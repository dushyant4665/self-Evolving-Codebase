import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          github_username: string
          github_access_token: string
          created_at: string
        }
        Insert: {
          id: string
          github_username: string
          github_access_token: string
          created_at?: string
        }
        Update: {
          id?: string
          github_username?: string
          github_access_token?: string
          created_at?: string
        }
      }
      repositories: {
        Row: {
          id: string
          user_id: string
          github_repo_id: number
          name: string
          full_name: string
          description: string | null
          private: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          github_repo_id: number
          name: string
          full_name: string
          description?: string | null
          private: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          github_repo_id?: number
          name?: string
          full_name?: string
          description?: string | null
          private?: boolean
          created_at?: string
        }
      }
      evolution_logs: {
        Row: {
          id: string
          repository_id: string
          suggestion_text: string
          status: 'pending' | 'pr_created' | 'tests_passed' | 'tests_failed' | 'merged' | 'rejected'
          pr_url: string | null
          diff_content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          repository_id: string
          suggestion_text: string
          status?: 'pending' | 'pr_created' | 'tests_passed' | 'tests_failed' | 'merged' | 'rejected'
          pr_url?: string | null
          diff_content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          repository_id?: string
          suggestion_text?: string
          status?: 'pending' | 'pr_created' | 'tests_passed' | 'tests_failed' | 'merged' | 'rejected'
          pr_url?: string | null
          diff_content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

