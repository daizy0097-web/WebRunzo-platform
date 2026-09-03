export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          business_name: string | null;
          role: 'admin' | 'client';
          client_tier: 'normal' | 'premium';
          customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          business_name?: string | null;
          role: 'admin' | 'client';
          client_tier?: 'normal' | 'premium';
          customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          business_name?: string | null;
          role?: 'admin' | 'client';
          client_tier?: 'normal' | 'premium';
          customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          business_name: string;
          email: string;
          phone: string | null;
          client_tier: 'normal' | 'premium';
          plan_id: string | null;
          template_id: string | null;
          payment_status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
          plan_start_date: string | null;
          plan_expiry_date: string | null;
          website_url: string | null;
          custom_domain: string | null;
          dns_status: string;
          ssl_status: string;
          website_status: 'Draft' | 'In Progress' | 'Live' | 'Suspended' | 'Expired';
          maintenance_notice: string | null;
          account_status: 'Active' | 'Pending' | 'Expired';
          notes: string | null;
          internal_notes: string | null;
          seo_score: number;
          speed_score: number;
          uptime_percent: number;
          auto_renew: boolean;
          sla_level: string;
          header_scripts: string | null;
          footer_scripts: string | null;
          subscription_state: string;
          grace_period_end_date: string | null;
          custom_content: Json;
          deployment: Json;
          activity_history: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string;
          plan_id: string | null;
          template_id: string | null;
          client_name: string;
          business_name: string;
          email: string;
          phone: string | null;
          amount: number;
          status: 'New' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
          payment_status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
          date: string;
          delivery_due_date: string | null;
          requirements: string | null;
          internal_notes: string | null;
          client_tier: string;
          milestones: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      plans: {
        Row: {
          id: string;
          name: string;
          monthly_price: number;
          annual_price: number;
          description: string | null;
          popular_badge: boolean;
          features: Json;
          max_pages: number;
          storage: string;
          support_level: string | null;
          revisions: string | null;
          domain_included: boolean;
          turnaround_days: number;
          tier: 'normal' | 'premium';
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      templates: {
        Row: {
          id: string;
          name: string;
          category: string;
          preview_image: string | null;
          description: string | null;
          long_description: string | null;
          features: Json;
          price: number;
          popular: boolean;
          is_new: boolean;
          featured: boolean;
          status: 'Published' | 'Draft' | 'Archived';
          tags: string[];
          demo_slug: string | null;
          is_master_template: boolean;
          ownership_status: string;
          license_status: string;
          copyright_notice: string | null;
          color_scheme: Json | null;
          sample_sections: Json | null;
          import_metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      customer_storage: {
        Row: {
          customer_id: string;
          max_physical_capacity_gb: number;
          base_plan_limit_gb: number;
          extra_granted_gb: number;
          used_bytes: number;
          breakdown: Json;
          updated_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      customer_files: {
        Row: {
          id: string;
          customer_id: string;
          name: string;
          category: 'image' | 'video' | 'document' | 'code' | 'database';
          size_bytes: number;
          size_formatted: string;
          mime_type: string | null;
          url: string | null;
          uploaded_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      support_tickets: {
        Row: {
          id: string;
          customer_id: string;
          client_name: string;
          email: string | null;
          business_name: string | null;
          website_url: string | null;
          client_tier: string;
          plan_id: string | null;
          plan_name: string | null;
          query_type: string;
          request_type: string | null;
          subject: string;
          category: string | null;
          priority: string;
          status: 'New' | 'In Review' | 'In Progress' | 'Waiting for Customer' | 'Resolved' | 'Closed';
          lead_tracking_status: string | null;
          message: string;
          attachment_name: string | null;
          attachment_size: string | null;
          preferred_completion_date: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
  };
}
