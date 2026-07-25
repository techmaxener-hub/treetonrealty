// Hand-written to match control-plane/supabase/migrations exactly --
// there's no live project to generate from. Mirrors tenant-template's
// approach: no PostgREST embedded-relationship selects, since there's no
// Relationships metadata to infer types from those queries correctly.

export type BrokerInstanceStatus = "provisioning" | "active" | "suspended" | "cancelled";
export type ProvisioningStep = "create_project" | "run_migrations" | "seed_defaults" | "deploy_frontend" | "assign_domain" | "done";
export type ProvisioningJobStatus = "pending" | "running" | "done" | "failed";
export type PlatformAdminRole = "super_admin" | "support";
export type BrokerSignupStatus = "pending" | "approved" | "rejected";

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3";
  };
  public: {
    Tables: {
      broker_instances: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: BrokerInstanceStatus;
          supabase_project_ref: string | null;
          supabase_url: string | null;
          secrets_ref: string | null;
          deployment_url: string | null;
          subdomain: string | null;
          custom_domain: string | null;
          plan_tier: string;
          owner_name: string | null;
          owner_email: string | null;
          owner_phone: string | null;
          created_at: string;
          provisioned_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["broker_instances"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["broker_instances"]["Row"]>;
        Relationships: [];
      };
      provisioning_jobs: {
        Row: {
          id: string;
          broker_instance_id: string;
          step: ProvisioningStep;
          status: ProvisioningJobStatus;
          log: string | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["provisioning_jobs"]["Row"]> & { broker_instance_id: string; step: ProvisioningStep };
        Update: Partial<Database["public"]["Tables"]["provisioning_jobs"]["Row"]>;
        Relationships: [];
      };
      platform_admins: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: PlatformAdminRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["platform_admins"]["Row"]> & { id: string; email: string };
        Update: Partial<Database["public"]["Tables"]["platform_admins"]["Row"]>;
        Relationships: [];
      };
      broker_signup_requests: {
        Row: {
          id: string;
          business_name: string;
          proposed_slug: string;
          owner_name: string;
          owner_email: string;
          owner_phone: string | null;
          plan_tier: string;
          message: string | null;
          status: BrokerSignupStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          broker_instance_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["broker_signup_requests"]["Row"]> & {
          business_name: string;
          proposed_slug: string;
          owner_name: string;
          owner_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["broker_signup_requests"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      request_broker_signup: {
        Args: {
          p_business_name: string;
          p_proposed_slug: string;
          p_owner_name: string;
          p_owner_email: string;
          p_owner_phone?: string | null;
          p_plan_tier?: string;
          p_message?: string | null;
        };
        Returns: string;
      };
      approve_broker_signup: {
        Args: { p_request_id: string; p_slug?: string | null };
        Returns: string;
      };
      reject_broker_signup: {
        Args: { p_request_id: string; p_reason?: string | null };
        Returns: undefined;
      };
      bootstrap_first_super_admin: {
        Args: { p_full_name?: string | null };
        Returns: undefined;
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
