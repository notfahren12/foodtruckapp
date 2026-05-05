export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          created_at: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          legal_name: string;
          ein_last4_optional: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          created_at: string;
        };
      };
      business_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: string;
          status: string;
          created_at: string;
        };
      };
      trucks: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          unit_number: string | null;
          vin: string | null;
          license_plate: string | null;
          photo_url: string | null;
          notes: string | null;
          active: boolean;
          created_at: string;
        };
      };
      jurisdictions: {
        Row: {
          id: string;
          name: string;
          type: string;
          state: string;
          county: string | null;
          city: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          active: boolean;
        };
      };
      requirement_templates: {
        Row: {
          id: string;
          jurisdiction_id: string;
          title: string;
          description: string;
          category: string;
          applies_to: string;
          required_document_type: string | null;
          renewal_interval_days: number | null;
          renewal_window_days: number | null;
          default_reminder_days: number[] | null;
          source_agency: string | null;
          source_url: string | null;
          source_contact: string | null;
          last_verified_at: string | null;
          verification_status: string | null;
          applies_if_json: Json | null;
          checklist_order: number | null;
          active: boolean;
        };
      };
      requirements: {
        Row: {
          id: string;
          business_id: string;
          truck_id: string | null;
          event_id: string | null;
          template_id: string | null;
          title: string;
          description: string | null;
          category: string;
          status: string;
          due_date: string | null;
          expiration_date: string | null;
          renewal_window_start: string | null;
          last_completed_date: string | null;
          next_action_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      documents: {
        Row: {
          id: string;
          business_id: string;
          truck_id: string | null;
          event_id: string | null;
          requirement_id: string | null;
          title: string;
          document_type: string;
          file_url: string;
          file_path: string;
          mime_type: string | null;
          status: string;
          issue_date: string | null;
          expiration_date: string | null;
          version: number;
          is_current: boolean;
          uploaded_by: string | null;
          notes: string | null;
          created_at: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          business_id: string;
          truck_id: string | null;
          event_id: string | null;
          requirement_id: string | null;
          title: string;
          type: string;
          agency: string | null;
          contact_id: string | null;
          location: string | null;
          start_time: string;
          end_time: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
      };
      events: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          organizer_contact_id: string | null;
          location: string | null;
          start_time: string;
          end_time: string | null;
          assigned_truck_ids: string[] | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          business_id: string | null;
          jurisdiction_id: string | null;
          name: string;
          organization: string | null;
          role: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          website: string | null;
          notes: string | null;
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          requirement_id: string | null;
          document_id: string | null;
          appointment_id: string | null;
          event_id: string | null;
          title: string;
          body: string;
          notification_type: string;
          scheduled_for: string;
          sent_at: string | null;
          status: string;
          created_at: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          business_id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata_json: Json | null;
          created_at: string;
        };
      };
      inspection_results: {
        Row: {
          id: string;
          business_id: string;
          truck_id: string;
          appointment_id: string | null;
          requirement_id: string | null;
          result: string;
          inspector_name: string | null;
          failure_reason: string | null;
          correction_needed: string | null;
          correction_deadline: string | null;
          reinspection_date: string | null;
          notes: string | null;
          created_at: string;
        };
      };
    };
  };
};
