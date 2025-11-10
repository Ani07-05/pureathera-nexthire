/**
 * Database Types
 * This will be auto-generated from Supabase in production
 * For now, we'll use a simplified manual version
 */

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
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'candidate' | 'recruiter'
          onboarded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role: 'candidate' | 'recruiter'
          onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'candidate' | 'recruiter'
          onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      candidate_profiles: {
        Row: {
          id: string
          target_role: string | null
          experience_years: number | null
          skills: string[] | null
          github_username: string | null
          github_data: Json | null
          bio: string | null
          location: string | null
          availability: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          target_role?: string | null
          experience_years?: number | null
          skills?: string[] | null
          github_username?: string | null
          github_data?: Json | null
          bio?: string | null
          location?: string | null
          availability?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          target_role?: string | null
          experience_years?: number | null
          skills?: string[] | null
          github_username?: string | null
          github_data?: Json | null
          bio?: string | null
          location?: string | null
          availability?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recruiter_profiles: {
        Row: {
          id: string
          company_name: string | null
          company_website: string | null
          position: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name?: string | null
          company_website?: string | null
          position?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string | null
          company_website?: string | null
          position?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      interview_results: {
        Row: {
          id: string
          user_id: string
          role: string
          level: 'L1' | 'L2' | 'L3'
          score: number | null
          strengths: string[] | null
          improvements: string[] | null
          assessment_summary: string | null
          transcript_summary: string | null
          vapi_session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          level: 'L1' | 'L2' | 'L3'
          score?: number | null
          strengths?: string[] | null
          improvements?: string[] | null
          assessment_summary?: string | null
          transcript_summary?: string | null
          vapi_session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          level?: 'L1' | 'L2' | 'L3'
          score?: number | null
          strengths?: string[] | null
          improvements?: string[] | null
          assessment_summary?: string | null
          transcript_summary?: string | null
          vapi_session_id?: string | null
          created_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          recruiter_id: string
          title: string
          description: string | null
          required_skills: string[] | null
          experience_level: 'entry' | 'mid' | 'senior'
          location: string | null
          salary_range: string | null
          status: 'draft' | 'active' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recruiter_id: string
          title: string
          description?: string | null
          required_skills?: string[] | null
          experience_level: 'entry' | 'mid' | 'senior'
          location?: string | null
          salary_range?: string | null
          status?: 'draft' | 'active' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recruiter_id?: string
          title?: string
          description?: string | null
          required_skills?: string[] | null
          experience_level?: 'entry' | 'mid' | 'senior'
          location?: string | null
          salary_range?: string | null
          status?: 'draft' | 'active' | 'closed'
          created_at?: string
          updated_at?: string
        }
      }
      candidate_matches: {
        Row: {
          id: string
          job_posting_id: string
          candidate_id: string
          match_score: number
          reasoning: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_posting_id: string
          candidate_id: string
          match_score: number
          reasoning?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_posting_id?: string
          candidate_id?: string
          match_score?: number
          reasoning?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      candidate_details: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          target_role: string | null
          experience_years: number | null
          skills: string[] | null
          github_username: string | null
          github_data: Json | null
          location: string | null
          availability: string | null
          total_interviews: number
          highest_level: 'L1' | 'L2' | 'L3' | null
          avg_score: number | null
          created_at: string
        }
      }
      recruiter_jobs_summary: {
        Row: {
          id: string
          title: string
          required_skills: string[] | null
          experience_level: 'entry' | 'mid' | 'senior'
          status: 'draft' | 'active' | 'closed'
          company_name: string | null
          match_count: number
          created_at: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
