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
          role: 'admin' | 'gerente' | 'employee'
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
          role?: 'admin' | 'gerente' | 'employee'
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
          role?: 'admin' | 'gerente' | 'employee'
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
      employees: {
        Row: {
          id: string
          full_name: string
          email: string | null
          position: string | null
          department: string | null
          cpf: string | null
          rg: string | null
          birth_date: string | null
          gender: string | null
          marital_status: string | null
          nationality: string | null
          phone: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          employee_code: string | null
          admission_date: string | null
          contract_type: string | null
          work_schedule: string | null
          salary: number | null
          avatar_url: string | null
          rg_photo: string | null
          cpf_photo: string | null
          ctps_photo: string | null
          diploma_photo: string | null
          vale_refeicao: number | null
          vale_transporte: number | null
          plano_saude: boolean | null
          plano_dental: boolean | null
          dependent_name_1: string | null
          dependent_relationship_1: string | null
          dependent_birth_date_1: string | null
          dependent_name_2: string | null
          dependent_relationship_2: string | null
          dependent_birth_date_2: string | null
          dependent_name_3: string | null
          dependent_relationship_3: string | null
          dependent_birth_date_3: string | null
          education_level: string | null
          course_name: string | null
          institution_name: string | null
          graduation_year: number | null
          bank_name: string | null
          bank_agency: string | null
          bank_account: string | null
          account_type: string | null
          pix_key: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email?: string | null
          position?: string | null
          department?: string | null
          cpf?: string | null
          rg?: string | null
          birth_date?: string | null
          gender?: string | null
          marital_status?: string | null
          nationality?: string | null
          phone?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          employee_code?: string | null
          admission_date?: string | null
          contract_type?: string | null
          work_schedule?: string | null
          salary?: number | null
          avatar_url?: string | null
          rg_photo?: string | null
          cpf_photo?: string | null
          ctps_photo?: string | null
          diploma_photo?: string | null
          vale_refeicao?: number | null
          vale_transporte?: number | null
          plano_saude?: boolean | null
          plano_dental?: boolean | null
          dependent_name_1?: string | null
          dependent_relationship_1?: string | null
          dependent_birth_date_1?: string | null
          dependent_name_2?: string | null
          dependent_relationship_2?: string | null
          dependent_birth_date_2?: string | null
          dependent_name_3?: string | null
          dependent_relationship_3?: string | null
          dependent_birth_date_3?: string | null
          education_level?: string | null
          course_name?: string | null
          institution_name?: string | null
          graduation_year?: number | null
          bank_name?: string | null
          bank_agency?: string | null
          bank_account?: string | null
          account_type?: string | null
          pix_key?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          position?: string | null
          department?: string | null
          cpf?: string | null
          rg?: string | null
          birth_date?: string | null
          gender?: string | null
          marital_status?: string | null
          nationality?: string | null
          phone?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          employee_code?: string | null
          admission_date?: string | null
          contract_type?: string | null
          work_schedule?: string | null
          salary?: number | null
          avatar_url?: string | null
          rg_photo?: string | null
          cpf_photo?: string | null
          ctps_photo?: string | null
          diploma_photo?: string | null
          vale_refeicao?: number | null
          vale_transporte?: number | null
          plano_saude?: boolean | null
          plano_dental?: boolean | null
          dependent_name_1?: string | null
          dependent_relationship_1?: string | null
          dependent_birth_date_1?: string | null
          dependent_name_2?: string | null
          dependent_relationship_2?: string | null
          dependent_birth_date_2?: string | null
          dependent_name_3?: string | null
          dependent_relationship_3?: string | null
          dependent_birth_date_3?: string | null
          education_level?: string | null
          course_name?: string | null
          institution_name?: string | null
          graduation_year?: number | null
          bank_name?: string | null
          bank_agency?: string | null
          bank_account?: string | null
          account_type?: string | null
          pix_key?: string | null
          notes?: string | null
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
      requests: {
        Row: {
          id: string
          employee_id: string
          department_id: string
          description: string
          urgency: 'Pequena' | 'Média' | 'Grande' | 'Urgente'
          status: 'requested' | 'approved' | 'rejected' | 'done'
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          department_id: string
          description: string
          urgency: 'Pequena' | 'Média' | 'Grande' | 'Urgente'
          status?: 'requested' | 'approved' | 'rejected' | 'done'
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          department_id?: string
          description?: string
          urgency?: 'Pequena' | 'Média' | 'Grande' | 'Urgente'
          status?: 'requested' | 'approved' | 'rejected' | 'done'
          created_at?: string
        }
      }
      invoice_files: {
        Row: {
          id: string
          employee_id: string
          recipient_id: string | null
          file_name: string
          file_path: string
          file_url: string
          file_size: number
          file_type: string
          description: string | null
          status: 'pending' | 'approved' | 'rejected'
          payment_status: 'pending' | 'paid'
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          recipient_id?: string | null
          file_name: string
          file_path: string
          file_url: string
          file_size: number
          file_type: string
          description?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          payment_status?: 'pending' | 'paid'
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          recipient_id?: string | null
          file_name?: string
          file_path?: string
          file_url?: string
          file_size?: number
          file_type?: string
          description?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          payment_status?: 'pending' | 'paid'
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_stars: {
        Row: {
          id: string
          user_id: string
          recipient_id: string
          reason: string
          message: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipient_id: string
          reason: string
          message: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipient_id?: string
          reason?: string
          message?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_dislikes: {
        Row: {
          id: string
          user_id: string
          recipient_id: string
          reason: string
          message: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipient_id: string
          reason: string
          message: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipient_id?: string
          reason?: string
          message?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_questions: {
        Row: {
          id: string
          department_id: string
          question: string
          question_type: 'text' | 'multiple_choice'
          options: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          department_id: string
          question: string
          question_type?: 'text' | 'multiple_choice'
          options?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          department_id?: string
          question?: string
          question_type?: 'text' | 'multiple_choice'
          options?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      daily_responses: {
        Row: {
          id: string
          question_id: string
          employee_id: string
          response: string
          response_date: string
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          employee_id: string
          response: string
          response_date: string
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          employee_id?: string
          response?: string
          response_date?: string
          created_at?: string
        }
      }
      processes: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          status: 'draft' | 'published' | 'archived'
          created_by: string
          department_id: string | null
          is_public: boolean
          flow_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          status?: 'draft' | 'published' | 'archived'
          created_by: string
          department_id?: string | null
          is_public?: boolean
          flow_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          status?: 'draft' | 'published' | 'archived'
          created_by?: string
          department_id?: string | null
          is_public?: boolean
          flow_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      process_approvals: {
        Row: {
          id: string
          process_id: string
          department_id: string
          manager_id: string
          status: 'pending' | 'approved' | 'rejected'
          comments: string | null
          created_at: string
          updated_at: string
          approved_at: string | null
          rejected_at: string | null
        }
        Insert: {
          id?: string
          process_id: string
          department_id: string
          manager_id: string
          status?: 'pending' | 'approved' | 'rejected'
          comments?: string | null
          created_at?: string
          updated_at?: string
          approved_at?: string | null
          rejected_at?: string | null
        }
        Update: {
          id?: string
          process_id?: string
          department_id?: string
          manager_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          comments?: string | null
          created_at?: string
          updated_at?: string
          approved_at?: string | null
          rejected_at?: string | null
        }
      }
      saved_hours: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string
          hours_saved: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: string
          hours_saved: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: string
          hours_saved?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      one_on_one_meetings: {
        Row: {
          id: string
          manager_id: string
          employee_id: string
          meeting_date: string
          participants: string[]
          description: string | null
          agreements: string | null
          expected_date: string | null
          manager_approved: boolean
          employee_approved: boolean
          status: 'scheduled' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manager_id: string
          employee_id: string
          meeting_date: string
          participants: string[]
          description?: string | null
          agreements?: string | null
          expected_date?: string | null
          manager_approved?: boolean
          employee_approved?: boolean
          status?: 'scheduled' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manager_id?: string
          employee_id?: string
          meeting_date?: string
          participants?: string[]
          description?: string | null
          agreements?: string | null
          expected_date?: string | null
          manager_approved?: boolean
          employee_approved?: boolean
          status?: 'scheduled' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

