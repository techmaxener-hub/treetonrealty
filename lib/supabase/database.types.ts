// Hand-authored to exactly match supabase/migrations/*.sql as of 2026-08-28 (15
// migrations, project ref leeksduuapufssuhykoq). `npx supabase gen types typescript
// --db-url ...` could not run in this environment because it requires a local
// Docker/Podman container runtime that isn't installed here. Once Docker or Podman
// is available, regenerate with:
//
//   npx supabase gen types typescript --db-url "postgresql://postgres.leeksduuapufssuhykoq:<password>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres" > lib/supabase/database.types.ts
//
// and diff against this file to confirm no drift.

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
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: string;
          reports_to: string | null;
          status: string;
          commission_percent: number | null;
          assigned_localities: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: string;
          reports_to?: string | null;
          status?: string;
          commission_percent?: number | null;
          assigned_localities?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          role?: string;
          reports_to?: string | null;
          status?: string;
          commission_percent?: number | null;
          assigned_localities?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_reports_to_fkey";
            columns: ["reports_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          id: boolean;
          whatsapp_number: string | null;
          rera_broker_reg_no: string | null;
          company_email: string | null;
          company_address: string | null;
          google_maps_embed_url: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          linkedin_url: string | null;
          stat_transacted_value_inr: number | null;
          stat_years_experience: number | null;
          stat_verified_inventory_count: number | null;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          whatsapp_number?: string | null;
          rera_broker_reg_no?: string | null;
          company_email?: string | null;
          company_address?: string | null;
          google_maps_embed_url?: string | null;
          instagram_url?: string | null;
          facebook_url?: string | null;
          linkedin_url?: string | null;
          stat_transacted_value_inr?: number | null;
          stat_years_experience?: number | null;
          stat_verified_inventory_count?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          whatsapp_number?: string | null;
          rera_broker_reg_no?: string | null;
          company_email?: string | null;
          company_address?: string | null;
          google_maps_embed_url?: string | null;
          instagram_url?: string | null;
          facebook_url?: string | null;
          linkedin_url?: string | null;
          stat_transacted_value_inr?: number | null;
          stat_years_experience?: number | null;
          stat_verified_inventory_count?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      developers: {
        Row: {
          id: string;
          name: string;
          logo_storage_path: string;
          logo_alt_text: string;
          website_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_storage_path: string;
          logo_alt_text: string;
          website_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_storage_path?: string;
          logo_alt_text?: string;
          website_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          slug: string;
          ref_code: string;
          title: string;
          description: string;
          property_type: Database["public"]["Enums"]["property_type_enum"];
          status: Database["public"]["Enums"]["listing_status_enum"];
          locality: string;
          city: string;
          state: string;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          bhk: number | null;
          bathrooms: number | null;
          carpet_area_sqft: number;
          built_up_area_sqft: number | null;
          price_inr: number;
          parking_charges_inr: number | null;
          furnishing_status: Database["public"]["Enums"]["furnishing_status_enum"] | null;
          possession_status: Database["public"]["Enums"]["possession_status_enum"];
          possession_date: string | null;
          facing_direction: Database["public"]["Enums"]["facing_direction_enum"] | null;
          vastu_score: Database["public"]["Enums"]["vastu_score_enum"] | null;
          is_rera_verified: boolean;
          virtual_tour_url: string | null;
          brochure_storage_path: string | null;
          is_published: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          ref_code: string;
          title: string;
          description: string;
          property_type: Database["public"]["Enums"]["property_type_enum"];
          status?: Database["public"]["Enums"]["listing_status_enum"];
          locality: string;
          city?: string;
          state?: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          bhk?: number | null;
          bathrooms?: number | null;
          carpet_area_sqft: number;
          built_up_area_sqft?: number | null;
          price_inr: number;
          parking_charges_inr?: number | null;
          furnishing_status?: Database["public"]["Enums"]["furnishing_status_enum"] | null;
          possession_status: Database["public"]["Enums"]["possession_status_enum"];
          possession_date?: string | null;
          facing_direction?: Database["public"]["Enums"]["facing_direction_enum"] | null;
          vastu_score?: Database["public"]["Enums"]["vastu_score_enum"] | null;
          is_rera_verified?: boolean;
          virtual_tour_url?: string | null;
          brochure_storage_path?: string | null;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          ref_code?: string;
          title?: string;
          description?: string;
          property_type?: Database["public"]["Enums"]["property_type_enum"];
          status?: Database["public"]["Enums"]["listing_status_enum"];
          locality?: string;
          city?: string;
          state?: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          bhk?: number | null;
          bathrooms?: number | null;
          carpet_area_sqft?: number;
          built_up_area_sqft?: number | null;
          price_inr?: number;
          parking_charges_inr?: number | null;
          furnishing_status?: Database["public"]["Enums"]["furnishing_status_enum"] | null;
          possession_status?: Database["public"]["Enums"]["possession_status_enum"];
          possession_date?: string | null;
          facing_direction?: Database["public"]["Enums"]["facing_direction_enum"] | null;
          vastu_score?: Database["public"]["Enums"]["vastu_score_enum"] | null;
          is_rera_verified?: boolean;
          virtual_tour_url?: string | null;
          brochure_storage_path?: string | null;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          alt_text: string;
          room_category: Database["public"]["Enums"]["room_category_enum"];
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          storage_path: string;
          alt_text: string;
          room_category: Database["public"]["Enums"]["room_category_enum"];
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          storage_path?: string;
          alt_text?: string;
          room_category?: Database["public"]["Enums"]["room_category_enum"];
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      listing_floor_plans: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          title: string;
          alt_text: string;
          plan_type: Database["public"]["Enums"]["floor_plan_type_enum"];
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          storage_path: string;
          title: string;
          alt_text: string;
          plan_type?: Database["public"]["Enums"]["floor_plan_type_enum"];
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          storage_path?: string;
          title?: string;
          alt_text?: string;
          plan_type?: Database["public"]["Enums"]["floor_plan_type_enum"];
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_floor_plans_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      amenities: {
        Row: {
          id: string;
          name: string;
          display_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          display_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          display_order?: number;
        };
        Relationships: [];
      };
      listing_amenities: {
        Row: {
          listing_id: string;
          amenity_id: string;
        };
        Insert: {
          listing_id: string;
          amenity_id: string;
        };
        Update: {
          listing_id?: string;
          amenity_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_amenities_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listing_amenities_amenity_id_fkey";
            columns: ["amenity_id"];
            isOneToOne: false;
            referencedRelation: "amenities";
            referencedColumns: ["id"];
          },
        ];
      };
      legal_title_types: {
        Row: {
          code: string;
          label: string;
          display_order: number;
        };
        Insert: {
          code: string;
          label: string;
          display_order?: number;
        };
        Update: {
          code?: string;
          label?: string;
          display_order?: number;
        };
        Relationships: [];
      };
      listing_legal_status: {
        Row: {
          listing_id: string;
          title_type_code: string;
          oc_status: Database["public"]["Enums"]["certificate_status_enum"];
          oc_date: string | null;
          cc_status: Database["public"]["Enums"]["certificate_status_enum"];
          cc_date: string | null;
          project_rera_number: string | null;
          project_rera_verification_url: string | null;
          updated_at: string;
        };
        Insert: {
          listing_id: string;
          title_type_code: string;
          oc_status?: Database["public"]["Enums"]["certificate_status_enum"];
          oc_date?: string | null;
          cc_status?: Database["public"]["Enums"]["certificate_status_enum"];
          cc_date?: string | null;
          project_rera_number?: string | null;
          project_rera_verification_url?: string | null;
          updated_at?: string;
        };
        Update: {
          listing_id?: string;
          title_type_code?: string;
          oc_status?: Database["public"]["Enums"]["certificate_status_enum"];
          oc_date?: string | null;
          cc_status?: Database["public"]["Enums"]["certificate_status_enum"];
          cc_date?: string | null;
          project_rera_number?: string | null;
          project_rera_verification_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_legal_status_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: true;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listing_legal_status_title_type_code_fkey";
            columns: ["title_type_code"];
            isOneToOne: false;
            referencedRelation: "legal_title_types";
            referencedColumns: ["code"];
          },
        ];
      };
      collections: {
        Row: {
          id: string;
          slug: string;
          title: string;
          intro_richtext: string;
          cover_image_storage_path: string | null;
          cover_image_alt_text: string | null;
          display_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          intro_richtext?: string;
          cover_image_storage_path?: string | null;
          cover_image_alt_text?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          intro_richtext?: string;
          cover_image_storage_path?: string | null;
          cover_image_alt_text?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      collection_listings: {
        Row: {
          collection_id: string;
          listing_id: string;
          display_order: number;
        };
        Insert: {
          collection_id: string;
          listing_id: string;
          display_order?: number;
        };
        Update: {
          collection_id?: string;
          listing_id?: string;
          display_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "collection_listings_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_listings_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          message: string | null;
          listing_id: string | null;
          property_interest: string | null;
          source: Database["public"]["Enums"]["lead_source_enum"];
          status: Database["public"]["Enums"]["lead_status_enum"];
          assigned_to: string | null;
          escalated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email?: string | null;
          message?: string | null;
          listing_id?: string | null;
          property_interest?: string | null;
          source: Database["public"]["Enums"]["lead_source_enum"];
          status?: Database["public"]["Enums"]["lead_status_enum"];
          assigned_to?: string | null;
          escalated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          message?: string | null;
          listing_id?: string | null;
          property_interest?: string | null;
          source?: Database["public"]["Enums"]["lead_source_enum"];
          status?: Database["public"]["Enums"]["lead_status_enum"];
          assigned_to?: string | null;
          escalated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      site_visits: {
        Row: {
          id: string;
          listing_id: string;
          lead_id: string | null;
          name: string;
          phone: string;
          email: string | null;
          preferred_date: string;
          preferred_time: string;
          cab_pickup_requested: boolean;
          pickup_address: string | null;
          status: Database["public"]["Enums"]["site_visit_status_enum"];
          assigned_to: string | null;
          reminder_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          lead_id?: string | null;
          name: string;
          phone: string;
          email?: string | null;
          preferred_date: string;
          preferred_time: string;
          cab_pickup_requested?: boolean;
          pickup_address?: string | null;
          status?: Database["public"]["Enums"]["site_visit_status_enum"];
          assigned_to?: string | null;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          lead_id?: string | null;
          name?: string;
          phone?: string;
          email?: string | null;
          preferred_date?: string;
          preferred_time?: string;
          cab_pickup_requested?: boolean;
          pickup_address?: string | null;
          status?: Database["public"]["Enums"]["site_visit_status_enum"];
          assigned_to?: string | null;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "site_visits_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visits_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visits_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      testimonials: {
        Row: {
          id: string;
          author_name: string;
          author_location: string | null;
          content: string;
          rating: number | null;
          avatar_storage_path: string | null;
          avatar_alt_text: string | null;
          display_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_name: string;
          author_location?: string | null;
          content: string;
          rating?: number | null;
          avatar_storage_path?: string | null;
          avatar_alt_text?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_name?: string;
          author_location?: string | null;
          content?: string;
          rating?: number | null;
          avatar_storage_path?: string | null;
          avatar_alt_text?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      stamp_duty_rates: {
        Row: {
          id: string;
          state: string;
          stamp_duty_percent: number;
          registration_percent: number;
          women_discount_percent: number | null;
          women_discount_notes: string | null;
          effective_from: string;
          source_notes: string | null;
          is_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          state: string;
          stamp_duty_percent: number;
          registration_percent: number;
          women_discount_percent?: number | null;
          women_discount_notes?: string | null;
          effective_from: string;
          source_notes?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          state?: string;
          stamp_duty_percent?: number;
          registration_percent?: number;
          women_discount_percent?: number | null;
          women_discount_notes?: string | null;
          effective_from?: string;
          source_notes?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          bio: string;
          photo_storage_path: string | null;
          photo_alt_text: string | null;
          display_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          role: string;
          bio: string;
          photo_storage_path?: string | null;
          photo_alt_text?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: string;
          bio?: string;
          photo_storage_path?: string | null;
          photo_alt_text?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      lead_activities: {
        Row: {
          id: string;
          lead_id: string;
          actor_id: string | null;
          activity_type: Database["public"]["Enums"]["lead_activity_type_enum"];
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          actor_id?: string | null;
          activity_type: Database["public"]["Enums"]["lead_activity_type_enum"];
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          actor_id?: string | null;
          activity_type?: Database["public"]["Enums"]["lead_activity_type_enum"];
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_activities_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lead_routing_settings: {
        Row: {
          id: boolean;
          mode: string;
          last_assigned_broker_id: string | null;
          stale_lead_hours: number;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          mode?: string;
          last_assigned_broker_id?: string | null;
          stale_lead_hours?: number;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          mode?: string;
          last_assigned_broker_id?: string | null;
          stale_lead_hours?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_routing_settings_last_assigned_broker_id_fkey";
            columns: ["last_assigned_broker_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          type: Database["public"]["Enums"]["notification_type_enum"];
          title: string;
          body: string;
          related_lead_id: string | null;
          related_site_visit_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          type: Database["public"]["Enums"]["notification_type_enum"];
          title: string;
          body: string;
          related_lead_id?: string | null;
          related_site_visit_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          type?: Database["public"]["Enums"]["notification_type_enum"];
          title?: string;
          body?: string;
          related_lead_id?: string | null;
          related_site_visit_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_related_lead_id_fkey";
            columns: ["related_lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_related_site_visit_id_fkey";
            columns: ["related_site_visit_id"];
            isOneToOne: false;
            referencedRelation: "site_visits";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_broker_or_above: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_admin_or_team_lead: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_self_or_downline: {
        Args: { target_user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      property_type_enum: "Apartment" | "Villa" | "Plot" | "Commercial" | "Office" | "Shop";
      listing_status_enum: "Active" | "Under Offer" | "Sold" | "Draft" | "Withdrawn";
      lead_activity_type_enum: "call" | "whatsapp" | "note" | "status_change" | "site_visit" | "email";
      notification_type_enum:
        | "lead_assigned"
        | "stale_lead"
        | "site_visit_reminder"
        | "site_visit_confirmed";
      furnishing_status_enum: "Unfurnished" | "Semi-Furnished" | "Fully-Furnished";
      possession_status_enum: "Ready" | "Under Construction";
      facing_direction_enum: "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW";
      vastu_score_enum: "Excellent" | "Good" | "Average" | "Not Vastu Compliant";
      room_category_enum:
        | "Living Room"
        | "Bedroom"
        | "Kitchen"
        | "Exterior"
        | "Amenities"
        | "Floor Plan";
      floor_plan_type_enum: "2D" | "3D";
      certificate_status_enum: "Not Applied" | "Applied" | "Received";
      lead_source_enum: "contact_page" | "brochure_download" | "site_visit_request" | "other";
      lead_status_enum:
        | "New"
        | "Contacted"
        | "Site Visit Scheduled"
        | "Site Visit Done"
        | "Token Paid"
        | "Closed Won"
        | "Closed Lost";
      site_visit_status_enum: "Requested" | "Confirmed" | "Completed" | "Cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;
