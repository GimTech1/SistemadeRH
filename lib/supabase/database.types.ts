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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'manager' | 'employee'
          department_id: string | null
          position: string | null
          admission_date: string | null
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'admin' | 'manager' | 'employee'
          department_id?: string | null
          position?: string | null
          admission_date?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'manager' | 'employee'
          department_id?: string | null
          position?: string | null
          admission_date?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          manager_id: string | null
          parent_department_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          manager_id?: string | null
          parent_department_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
          parent_department_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          description: string | null
          category: 'conhecimento' | 'habilidade' | 'atitude'
          department_id: string | null
          is_global: boolean
          weight: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: 'conhecimento' | 'habilidade' | 'atitude'
          department_id?: string | null
          is_global?: boolean
          weight?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: 'conhecimento' | 'habilidade' | 'atitude'
          department_id?: string | null
          is_global?: boolean
          weight?: number
          created_at?: string
          updated_at?: string
        }
      }
      evaluation_cycles: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          cycle_id: string | null
          employee_id: string | null
          evaluator_id: string | null
          status: 'draft' | 'in_progress' | 'completed' | 'reviewed'
          overall_score: number | null
          comments: string | null
          strengths: string | null
          improvements: string | null
          goals: string | null
          submitted_at: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cycle_id?: string | null
          employee_id?: string | null
          evaluator_id?: string | null
          status?: 'draft' | 'in_progress' | 'completed' | 'reviewed'
          overall_score?: number | null
          comments?: string | null
          strengths?: string | null
          improvements?: string | null
          goals?: string | null
          submitted_at?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cycle_id?: string | null
          employee_id?: string | null
          evaluator_id?: string | null
          status?: 'draft' | 'in_progress' | 'completed' | 'reviewed'
          overall_score?: number | null
          comments?: string | null
          strengths?: string | null
          improvements?: string | null
          goals?: string | null
          submitted_at?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      evaluation_skills: {
        Row: {
          id: string
          evaluation_id: string | null
          skill_id: string | null
          score: number | null
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          evaluation_id?: string | null
          skill_id?: string | null
          score?: number | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          evaluation_id?: string | null
          skill_id?: string | null
          score?: number | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      external_feedback: {
        Row: {
          id: string
          employee_id: string | null
          evaluator_name: string
          evaluator_email: string | null
          evaluator_id: string | null
          cycle_id: string | null
          feedback: string | null
          score: number | null
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          id?: string
          employee_id?: string | null
          evaluator_name: string
          evaluator_email?: string | null
          evaluator_id?: string | null
          cycle_id?: string | null
          feedback?: string | null
          score?: number | null
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string | null
          evaluator_name?: string
          evaluator_email?: string | null
          evaluator_id?: string | null
          cycle_id?: string | null
          feedback?: string | null
          score?: number | null
          is_anonymous?: boolean
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          employee_id: string | null
          title: string
          description: string | null
          target_date: string | null
          progress: number
          is_completed: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id?: string | null
          title: string
          description?: string | null
          target_date?: string | null
          progress?: number
          is_completed?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string | null
          title?: string
          description?: string | null
          target_date?: string | null
          progress?: number
          is_completed?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      performance_history: {
        Row: {
          id: string
          employee_id: string | null
          cycle_id: string | null
          overall_score: number | null
          ranking: number | null
          percentile: number | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id?: string | null
          cycle_id?: string | null
          overall_score?: number | null
          ranking?: number | null
          percentile?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string | null
          cycle_id?: string | null
          overall_score?: number | null
          ranking?: number | null
          percentile?: number | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          title: string
          message: string
          type: string | null
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          message: string
          type?: string | null
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          message?: string
          type?: string | null
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
      }
    }
  }
}

