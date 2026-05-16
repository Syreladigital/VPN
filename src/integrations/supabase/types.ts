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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action_type: string
          actor_id: string
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          actor_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          actor_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      audit_actions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string
          id: string
          item_id: string
          priority: number
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description: string
          id?: string
          item_id: string
          priority?: number
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          item_id?: string
          priority?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_actions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "audit_items"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_attempt_answers: {
        Row: {
          attempt_id: string
          created_at: string
          id: string
          is_critical: boolean | null
          max_score: number
          notes: string | null
          question_id: string
          risk_level: string | null
          score: number
          section_id: string
          selected_value: string | null
        }
        Insert: {
          attempt_id: string
          created_at?: string
          id?: string
          is_critical?: boolean | null
          max_score?: number
          notes?: string | null
          question_id: string
          risk_level?: string | null
          score?: number
          section_id: string
          selected_value?: string | null
        }
        Update: {
          attempt_id?: string
          created_at?: string
          id?: string
          is_critical?: boolean | null
          max_score?: number
          notes?: string | null
          question_id?: string
          risk_level?: string | null
          score?: number
          section_id?: string
          selected_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "audit_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_attempt_sections: {
        Row: {
          attempt_id: string
          conform_status: string
          conforme_count: number
          created_at: string
          earned: number
          high_risk_count: number
          id: string
          non_conforme_count: number
          partiel_count: number
          percent: number
          possible: number
          section_id: string
          section_title: string
        }
        Insert: {
          attempt_id: string
          conform_status?: string
          conforme_count?: number
          created_at?: string
          earned?: number
          high_risk_count?: number
          id?: string
          non_conforme_count?: number
          partiel_count?: number
          percent?: number
          possible?: number
          section_id: string
          section_title: string
        }
        Update: {
          attempt_id?: string
          conform_status?: string
          conforme_count?: number
          created_at?: string
          earned?: number
          high_risk_count?: number
          id?: string
          non_conforme_count?: number
          partiel_count?: number
          percent?: number
          possible?: number
          section_id?: string
          section_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_attempt_sections_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "audit_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_attempts: {
        Row: {
          answered_questions: number
          audit_type: string
          completed_at: string | null
          created_at: string
          earned: number
          id: string
          organisation_id: string
          possible: number
          score_percent: number
          status: string
          total_questions: number
        }
        Insert: {
          answered_questions?: number
          audit_type: string
          completed_at?: string | null
          created_at?: string
          earned?: number
          id?: string
          organisation_id: string
          possible?: number
          score_percent?: number
          status?: string
          total_questions?: number
        }
        Update: {
          answered_questions?: number
          audit_type?: string
          completed_at?: string | null
          created_at?: string
          earned?: number
          id?: string
          organisation_id?: string
          possible?: number
          score_percent?: number
          status?: string
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_attempts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_history: {
        Row: {
          audit_id: string
          completed_actions: number
          conformity_score: number
          high_risk_count: number
          id: string
          notes: string | null
          snapshot_date: string
          total_actions: number
        }
        Insert: {
          audit_id: string
          completed_actions: number
          conformity_score: number
          high_risk_count: number
          id?: string
          notes?: string | null
          snapshot_date?: string
          total_actions: number
        }
        Update: {
          audit_id?: string
          completed_actions?: number
          conformity_score?: number
          high_risk_count?: number
          id?: string
          notes?: string | null
          snapshot_date?: string
          total_actions?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_history_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_items: {
        Row: {
          ai_generated: boolean
          created_at: string
          description: string | null
          dpo_comments: string | null
          id: string
          module_id: string
          risk_justification: string | null
          risk_level: Database["public"]["Enums"]["risk_level_type"]
          status: Database["public"]["Enums"]["conformity_status_type"]
          title: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          created_at?: string
          description?: string | null
          dpo_comments?: string | null
          id?: string
          module_id: string
          risk_justification?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level_type"]
          status?: Database["public"]["Enums"]["conformity_status_type"]
          title: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          created_at?: string
          description?: string | null
          dpo_comments?: string | null
          id?: string
          module_id?: string
          risk_justification?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level_type"]
          status?: Database["public"]["Enums"]["conformity_status_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_items_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "audit_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          new_data: Json | null
          old_data: Json | null
          organisation_id: string | null
          record_id: string
          table_name: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          organisation_id?: string | null
          record_id: string
          table_name: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          organisation_id?: string | null
          record_id?: string
          table_name?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_modules: {
        Row: {
          audit_id: string
          created_at: string
          description: string | null
          id: string
          module_key: string
          name: string
          status: Database["public"]["Enums"]["conformity_status_type"]
          updated_at: string
        }
        Insert: {
          audit_id: string
          created_at?: string
          description?: string | null
          id?: string
          module_key: string
          name: string
          status?: Database["public"]["Enums"]["conformity_status_type"]
          updated_at?: string
        }
        Update: {
          audit_id?: string
          created_at?: string
          description?: string | null
          id?: string
          module_key?: string
          name?: string
          status?: Database["public"]["Enums"]["conformity_status_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_modules_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_results: {
        Row: {
          actions_completed: number
          actions_total: number
          answered_questions: number
          attempt_id: string
          audit_type: string
          completed_at: string
          compliance_score: number
          conforme_count: number
          created_at: string
          earned: number
          id: string
          is_latest: boolean
          non_conforme_count: number
          organisation_id: string
          partiel_count: number
          possible: number
          risks_high: number
          risks_low: number
          risks_medium: number
          total_questions: number
          updated_at: string
        }
        Insert: {
          actions_completed?: number
          actions_total?: number
          answered_questions?: number
          attempt_id: string
          audit_type: string
          completed_at?: string
          compliance_score?: number
          conforme_count?: number
          created_at?: string
          earned?: number
          id?: string
          is_latest?: boolean
          non_conforme_count?: number
          organisation_id: string
          partiel_count?: number
          possible?: number
          risks_high?: number
          risks_low?: number
          risks_medium?: number
          total_questions?: number
          updated_at?: string
        }
        Update: {
          actions_completed?: number
          actions_total?: number
          answered_questions?: number
          attempt_id?: string
          audit_type?: string
          completed_at?: string
          compliance_score?: number
          conforme_count?: number
          created_at?: string
          earned?: number
          id?: string
          is_latest?: boolean
          non_conforme_count?: number
          organisation_id?: string
          partiel_count?: number
          possible?: number
          risks_high?: number
          risks_low?: number
          risks_medium?: number
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "audit_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_results_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          completed_actions: number
          conformity_score: number
          created_at: string
          high_risk_count: number
          id: string
          organisation_id: string
          status: string
          total_actions: number
          updated_at: string
        }
        Insert: {
          completed_actions?: number
          conformity_score?: number
          created_at?: string
          high_risk_count?: number
          id?: string
          organisation_id: string
          status?: string
          total_actions?: number
          updated_at?: string
        }
        Update: {
          completed_actions?: number
          conformity_score?: number
          created_at?: string
          high_risk_count?: number
          id?: string
          organisation_id?: string
          status?: string
          total_actions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audits_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_access: {
        Row: {
          client_user_id: string
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          organisation_id: string
          updated_at: string
        }
        Insert: {
          client_user_id: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          organisation_id: string
          updated_at?: string
        }
        Update: {
          client_user_id?: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          organisation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_access_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      conformity_scores: {
        Row: {
          answered_questions: number
          calculated_at: string
          conformity_level: string
          created_at: string
          critical_questions_passed: number
          critical_questions_total: number
          high_risk_count: number
          id: string
          low_risk_count: number
          medium_risk_count: number
          organisation_id: string
          overall_max_score: number
          overall_percentage: number
          overall_score: number
          priority_recommendations: Json | null
          section_scores: Json | null
          total_questions: number
          updated_at: string
        }
        Insert: {
          answered_questions?: number
          calculated_at?: string
          conformity_level?: string
          created_at?: string
          critical_questions_passed?: number
          critical_questions_total?: number
          high_risk_count?: number
          id?: string
          low_risk_count?: number
          medium_risk_count?: number
          organisation_id: string
          overall_max_score?: number
          overall_percentage?: number
          overall_score?: number
          priority_recommendations?: Json | null
          section_scores?: Json | null
          total_questions?: number
          updated_at?: string
        }
        Update: {
          answered_questions?: number
          calculated_at?: string
          conformity_level?: string
          created_at?: string
          critical_questions_passed?: number
          critical_questions_total?: number
          high_risk_count?: number
          id?: string
          low_risk_count?: number
          medium_risk_count?: number
          organisation_id?: string
          overall_max_score?: number
          overall_percentage?: number
          overall_score?: number
          priority_recommendations?: Json | null
          section_scores?: Json | null
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conformity_scores_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      corrective_actions: {
        Row: {
          attempt_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          impact_score: number
          organisation_id: string
          priority: number
          question_id: string
          section_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          attempt_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          impact_score?: number
          organisation_id: string
          priority?: number
          question_id: string
          section_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          attempt_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          impact_score?: number
          organisation_id?: string
          priority?: number
          question_id?: string
          section_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "corrective_actions_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "audit_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_breaches: {
        Row: {
          breach_date: string
          categories_affected: string[] | null
          cnil_notification_date: string | null
          cnil_notified: boolean | null
          consequences: string | null
          created_at: string
          discovery_date: string
          estimated_count: number | null
          id: string
          measures_taken: string | null
          nature: string
          notes: string | null
          notification_deadline: string | null
          organisation_id: string
          persons_informed: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          breach_date: string
          categories_affected?: string[] | null
          cnil_notification_date?: string | null
          cnil_notified?: boolean | null
          consequences?: string | null
          created_at?: string
          discovery_date: string
          estimated_count?: number | null
          id?: string
          measures_taken?: string | null
          nature: string
          notes?: string | null
          notification_deadline?: string | null
          organisation_id: string
          persons_informed?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          breach_date?: string
          categories_affected?: string[] | null
          cnil_notification_date?: string | null
          cnil_notified?: boolean | null
          consequences?: string | null
          created_at?: string
          discovery_date?: string
          estimated_count?: number | null
          id?: string
          measures_taken?: string | null
          nature?: string
          notes?: string | null
          notification_deadline?: string | null
          organisation_id?: string
          persons_informed?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_breaches_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          alert_type: string
          error_message: string | null
          id: string
          notification_id: string | null
          organisation_id: string
          recipients: string[]
          sent_at: string
          status: string
          subject: string
        }
        Insert: {
          alert_type: string
          error_message?: string | null
          id?: string
          notification_id?: string | null
          organisation_id: string
          recipients: string[]
          sent_at?: string
          status?: string
          subject: string
        }
        Update: {
          alert_type?: string
          error_message?: string | null
          id?: string
          notification_id?: string | null
          organisation_id?: string
          recipients?: string[]
          sent_at?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notification_settings: {
        Row: {
          breach_email_body_template: string | null
          breach_email_subject_template: string | null
          breach_reminder_hours: number | null
          corrective_actions_reminder_days: number | null
          created_at: string
          email_recipients: string[] | null
          enabled: boolean | null
          id: string
          notify_breaches: boolean | null
          notify_corrective_actions: boolean | null
          notify_requester_on_status_change: boolean | null
          notify_rights_requests: boolean | null
          notify_subprocessors: boolean | null
          organisation_id: string
          reply_to_email: string | null
          rights_email_body_template: string | null
          rights_email_completed_message: string | null
          rights_email_in_progress_message: string | null
          rights_email_rejected_message: string | null
          rights_email_subject_template: string | null
          rights_reminder_days: number | null
          sender_name: string | null
          subprocessor_email_body_template: string | null
          subprocessor_email_subject_template: string | null
          subprocessor_reminder_days: number | null
          updated_at: string
        }
        Insert: {
          breach_email_body_template?: string | null
          breach_email_subject_template?: string | null
          breach_reminder_hours?: number | null
          corrective_actions_reminder_days?: number | null
          created_at?: string
          email_recipients?: string[] | null
          enabled?: boolean | null
          id?: string
          notify_breaches?: boolean | null
          notify_corrective_actions?: boolean | null
          notify_requester_on_status_change?: boolean | null
          notify_rights_requests?: boolean | null
          notify_subprocessors?: boolean | null
          organisation_id: string
          reply_to_email?: string | null
          rights_email_body_template?: string | null
          rights_email_completed_message?: string | null
          rights_email_in_progress_message?: string | null
          rights_email_rejected_message?: string | null
          rights_email_subject_template?: string | null
          rights_reminder_days?: number | null
          sender_name?: string | null
          subprocessor_email_body_template?: string | null
          subprocessor_email_subject_template?: string | null
          subprocessor_reminder_days?: number | null
          updated_at?: string
        }
        Update: {
          breach_email_body_template?: string | null
          breach_email_subject_template?: string | null
          breach_reminder_hours?: number | null
          corrective_actions_reminder_days?: number | null
          created_at?: string
          email_recipients?: string[] | null
          enabled?: boolean | null
          id?: string
          notify_breaches?: boolean | null
          notify_corrective_actions?: boolean | null
          notify_requester_on_status_change?: boolean | null
          notify_rights_requests?: boolean | null
          notify_subprocessors?: boolean | null
          organisation_id?: string
          reply_to_email?: string | null
          rights_email_body_template?: string | null
          rights_email_completed_message?: string | null
          rights_email_in_progress_message?: string | null
          rights_email_rejected_message?: string | null
          rights_email_subject_template?: string | null
          rights_reminder_days?: number | null
          sender_name?: string | null
          subprocessor_email_body_template?: string | null
          subprocessor_email_subject_template?: string | null
          subprocessor_reminder_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_notification_settings_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: true
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_audit_results: {
        Row: {
          acceptable_count: number
          alerts: Json
          answers: Json
          audit_type: string
          completed_at: string
          created_at: string
          critical_count: number
          flow_map: Json
          id: string
          organisation_id: string
          sensitive_count: number
          total_alerts: number
          updated_at: string
        }
        Insert: {
          acceptable_count?: number
          alerts?: Json
          answers?: Json
          audit_type?: string
          completed_at?: string
          created_at?: string
          critical_count?: number
          flow_map?: Json
          id?: string
          organisation_id: string
          sensitive_count?: number
          total_alerts?: number
          updated_at?: string
        }
        Update: {
          acceptable_count?: number
          alerts?: Json
          answers?: Json
          audit_type?: string
          completed_at?: string
          created_at?: string
          critical_count?: number
          flow_map?: Json
          id?: string
          organisation_id?: string
          sensitive_count?: number
          total_alerts?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flash_audit_results_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_from_consultant: boolean
          organisation_id: string
          read_at: string | null
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_from_consultant?: boolean
          organisation_id: string
          read_at?: string | null
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_from_consultant?: boolean
          organisation_id?: string
          read_at?: string | null
          sender_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          dismissed: boolean
          due_date: string | null
          id: string
          message: string
          organisation_id: string
          read: boolean
          reference_id: string | null
          reference_type: string | null
          severity: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dismissed?: boolean
          due_date?: string | null
          id?: string
          message: string
          organisation_id: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          severity?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dismissed?: boolean
          due_date?: string | null
          id?: string
          message?: string
          organisation_id?: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          severity?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          country: Database["public"]["Enums"]["country_type"]
          created_at: string
          dpo_role: Database["public"]["Enums"]["dpo_role_type"]
          id: string
          legal_framework: Database["public"]["Enums"]["legal_framework_type"]
          name: string
          sector: Database["public"]["Enums"]["sector_type"]
          size: Database["public"]["Enums"]["organisation_size_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          country: Database["public"]["Enums"]["country_type"]
          created_at?: string
          dpo_role: Database["public"]["Enums"]["dpo_role_type"]
          id?: string
          legal_framework: Database["public"]["Enums"]["legal_framework_type"]
          name: string
          sector: Database["public"]["Enums"]["sector_type"]
          size: Database["public"]["Enums"]["organisation_size_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          country?: Database["public"]["Enums"]["country_type"]
          created_at?: string
          dpo_role?: Database["public"]["Enums"]["dpo_role_type"]
          id?: string
          legal_framework?: Database["public"]["Enums"]["legal_framework_type"]
          name?: string
          sector?: Database["public"]["Enums"]["sector_type"]
          size?: Database["public"]["Enums"]["organisation_size_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      processing_records: {
        Row: {
          created_at: string
          data_categories: Json | null
          data_subjects: string[] | null
          dpo_validation: boolean | null
          dpo_validation_date: string | null
          id: string
          legal_basis: string
          name: string
          organisation_id: string
          purposes: string
          recipients: string[] | null
          retention_period: string | null
          security_measures: string | null
          transfer_safeguards: string | null
          transfers_outside_eu: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_categories?: Json | null
          data_subjects?: string[] | null
          dpo_validation?: boolean | null
          dpo_validation_date?: string | null
          id?: string
          legal_basis: string
          name: string
          organisation_id: string
          purposes: string
          recipients?: string[] | null
          retention_period?: string | null
          security_measures?: string | null
          transfer_safeguards?: string | null
          transfers_outside_eu?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_categories?: Json | null
          data_subjects?: string[] | null
          dpo_validation?: boolean | null
          dpo_validation_date?: string | null
          id?: string
          legal_basis?: string
          name?: string
          organisation_id?: string
          purposes?: string
          recipients?: string[] | null
          retention_period?: string | null
          security_measures?: string | null
          transfer_safeguards?: string | null
          transfers_outside_eu?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_records_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          answers: Json
          created_at: string
          id: string
          notes: Json | null
          organisation_id: string
          sector: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          notes?: Json | null
          organisation_id: string
          sector: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          notes?: Json | null
          organisation_id?: string
          sector?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      rights_requests: {
        Row: {
          created_at: string
          deadline: string | null
          id: string
          identity_verified: boolean | null
          notes: string | null
          organisation_id: string
          request_date: string
          requester_email: string | null
          requester_name: string
          response_content: string | null
          response_date: string | null
          right_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          id?: string
          identity_verified?: boolean | null
          notes?: string | null
          organisation_id: string
          request_date: string
          requester_email?: string | null
          requester_name: string
          response_content?: string | null
          response_date?: string | null
          right_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          id?: string
          identity_verified?: boolean | null
          notes?: string | null
          organisation_id?: string
          request_date?: string
          requester_email?: string | null
          requester_name?: string
          response_content?: string | null
          response_date?: string | null
          right_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rights_requests_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      subprocessors: {
        Row: {
          activity: string
          contract_date: string | null
          contract_signed: boolean | null
          created_at: string
          data_processed: Json | null
          eu_based: boolean | null
          hds_certified: boolean | null
          id: string
          location: string | null
          name: string
          organisation_id: string
          review_date: string | null
          status: string
          transfer_mechanism: string | null
          updated_at: string
        }
        Insert: {
          activity: string
          contract_date?: string | null
          contract_signed?: boolean | null
          created_at?: string
          data_processed?: Json | null
          eu_based?: boolean | null
          hds_certified?: boolean | null
          id?: string
          location?: string | null
          name: string
          organisation_id: string
          review_date?: string | null
          status?: string
          transfer_mechanism?: string | null
          updated_at?: string
        }
        Update: {
          activity?: string
          contract_date?: string | null
          contract_signed?: boolean | null
          created_at?: string
          data_processed?: Json | null
          eu_based?: boolean | null
          hds_certified?: boolean | null
          id?: string
          location?: string | null
          name?: string
          organisation_id?: string
          review_date?: string | null
          status?: string
          transfer_mechanism?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subprocessors_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      delete_user_by_super_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      get_anonymized_statistics: { Args: never; Returns: Json }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_users_with_emails: {
        Args: never
        Returns: {
          email: string
          user_id: string
        }[]
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_client_access: {
        Args: { _organisation_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_client: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "super_admin" | "client"
      conformity_status_type:
        | "conforme"
        | "partiellement_conforme"
        | "non_conforme"
      country_type: "france" | "eu_other" | "tunisie"
      dpo_role_type: "interne" | "externe" | "consultant"
      legal_framework_type: "rgpd_eu" | "loi_tunisie_2025"
      organisation_size_type: "independant" | "tpe" | "pme" | "groupe"
      risk_level_type: "faible" | "moyen" | "eleve"
      sector_type:
        | "sante_reglementee_pharmacien"
        | "sante_reglementee_medecin"
        | "sante_non_reglementee_bien_etre"
        | "assurance_vie"
        | "assurance_non_vie"
        | "transport_logistique"
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
      app_role: ["admin", "user", "super_admin", "client"],
      conformity_status_type: [
        "conforme",
        "partiellement_conforme",
        "non_conforme",
      ],
      country_type: ["france", "eu_other", "tunisie"],
      dpo_role_type: ["interne", "externe", "consultant"],
      legal_framework_type: ["rgpd_eu", "loi_tunisie_2025"],
      organisation_size_type: ["independant", "tpe", "pme", "groupe"],
      risk_level_type: ["faible", "moyen", "eleve"],
      sector_type: [
        "sante_reglementee_pharmacien",
        "sante_reglementee_medecin",
        "sante_non_reglementee_bien_etre",
        "assurance_vie",
        "assurance_non_vie",
        "transport_logistique",
      ],
    },
  },
} as const
