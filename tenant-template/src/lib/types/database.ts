// Hand-written to match tenant-template/supabase/migrations exactly.
// There's no live Supabase project yet to run `supabase gen types` against
// -- regenerate from the real project once one exists, and diff against
// this file rather than trusting it blindly.

export type ProfileRole = "broker" | "employee" | "master_advisor" | "advisor";
export type ContactTypeEnum = "buyer" | "seller" | "tenant" | "landlord" | "past_client";
export type PropertyTypeEnum = "apartment" | "villa" | "plot" | "commercial" | "farmhouse" | "penthouse";
export type ListingSegment = "luxury" | "premium" | "affordable" | "commercial" | "weekend_home";
export type ListingOfferType = "sale" | "rent";
export type ListingStatus = "available" | "under_offer" | "sold" | "rented" | "off_market";
export type PossessionStatus = "ready_to_move" | "under_construction";
export type ListingMediaType = "photo" | "floor_plan" | "video_youtube" | "document";
export type LeadSource =
  | "website_form"
  | "whatsapp_click"
  | "instagram"
  | "referral"
  | "walk_in"
  | "magicbricks"
  | "acres_99"
  | "google"
  | "other";
export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "site_visit_scheduled"
  | "site_visit_done"
  | "negotiation"
  | "documentation"
  | "closed_won"
  | "closed_lost";
export type LeadScore = "hot" | "warm" | "cold";
export type ActivityType = "call" | "whatsapp_message" | "email" | "note" | "site_visit" | "status_change" | "task";
export type TaskStatus = "pending" | "done";
export type DealStage = "negotiation" | "documentation" | "closed";
export type DealDocType = "agreement" | "token_receipt" | "kyc_buyer" | "kyc_seller" | "other";
export type DealDocStatus = "pending" | "uploaded" | "verified";
export type AutomationTriggerType =
  | "new_lead"
  | "no_response_sla"
  | "drip_sequence"
  | "new_listing_match"
  | "post_site_visit"
  | "post_closing"
  | "abandoned_browse"
  | "birthday_anniversary"
  | "price_drop_status_change";
export type AutomationLogStatus = "pending" | "sent" | "failed";
export type NotificationChannel = "whatsapp" | "email" | "sms";
export type AlertChannel = "email" | "whatsapp" | "both";
export type TestimonialSource = "manual" | "google" | "magicpin";
export type PageEventType = "listing_view" | "whatsapp_click" | "form_submit" | "search";

export type LocalizedText = Partial<Record<"en" | "hi" | "gu", string>>;

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      broker_profile: {
        Row: {
          id: true;
          display_name: string;
          legal_name: string | null;
          branding: Record<string, unknown>;
          contact: Record<string, unknown>;
          social_links: Record<string, unknown>;
          default_language: string;
          supported_languages: string[];
          seo: Record<string, unknown>;
          years_in_business: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["broker_profile"]["Row"]> & { display_name: string };
        Update: Partial<Database["public"]["Tables"]["broker_profile"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: ProfileRole;
          reports_to_id: string | null;
          hierarchy_path: string | null;
          full_name: string;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; role: ProfileRole; full_name: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      advisor_profiles: {
        Row: {
          id: string;
          profile_id: string;
          slug: string;
          display_name: string;
          bio: LocalizedText;
          specialization: string[];
          years_experience: number | null;
          languages_spoken: string[];
          photo_url: string | null;
          linkedin_url: string | null;
          instagram_url: string | null;
          is_public: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["advisor_profiles"]["Row"]> & { profile_id: string; slug: string; display_name: string };
        Update: Partial<Database["public"]["Tables"]["advisor_profiles"]["Row"]>;
        Relationships: [];
      };
      localities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          city: string | null;
          state: string | null;
          content: Record<string, unknown>;
          hero_image_url: string | null;
          seo: Record<string, unknown>;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["localities"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["localities"]["Row"]>;
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          advisor_id: string | null;
          locality_id: string | null;
          title: LocalizedText;
          description: LocalizedText;
          slug: string;
          property_type: PropertyTypeEnum;
          segment: ListingSegment;
          offer_type: ListingOfferType;
          status: ListingStatus;
          price: number | null;
          maintenance_charges: number | null;
          bhk: number | null;
          carpet_area_sqft: number | null;
          builtup_area_sqft: number | null;
          floor_number: number | null;
          total_floors: number | null;
          developer_name: string | null;
          possession_status: PossessionStatus | null;
          possession_date: string | null;
          amenities: string[];
          address: string | null;
          lat: number | null;
          lng: number | null;
          is_exclusive: boolean;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["listings"]["Row"]> & {
          slug: string;
          property_type: PropertyTypeEnum;
          segment: ListingSegment;
          offer_type: ListingOfferType;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Row"]>;
        Relationships: [];
      };
      listing_internal: {
        Row: {
          listing_id: string;
          commission_percent: number | null;
          seller_flexibility_notes: string | null;
          internal_notes: string | null;
          exclusive_agreement_expiry: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["listing_internal"]["Row"]> & { listing_id: string };
        Update: Partial<Database["public"]["Tables"]["listing_internal"]["Row"]>;
        Relationships: [];
      };
      listing_owners: {
        Row: {
          id: string;
          listing_id: string;
          contact_id: string;
          confidential: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["listing_owners"]["Row"]> & { listing_id: string; contact_id: string };
        Update: Partial<Database["public"]["Tables"]["listing_owners"]["Row"]>;
        Relationships: [];
      };
      listing_media: {
        Row: {
          id: string;
          listing_id: string;
          media_type: ListingMediaType;
          url: string;
          caption: LocalizedText | null;
          display_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["listing_media"]["Row"]> & {
          listing_id: string;
          media_type: ListingMediaType;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["listing_media"]["Row"]>;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          normalized_phone: string;
          email: string | null;
          whatsapp_number: string | null;
          potential_duplicate_of: string | null;
          contact_type: ContactTypeEnum[];
          preferences: {
            budget_min?: number;
            budget_max?: number;
            localities?: string[];
            bhk?: number[];
            property_type?: PropertyTypeEnum[];
            segment?: ListingSegment[];
          };
          notes: string | null;
          date_of_birth: string | null;
          anniversary_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contacts"]["Row"]> & { full_name: string };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Row"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          contact_id: string;
          listing_id: string | null;
          assigned_advisor_id: string | null;
          source: LeadSource;
          source_detail: string | null;
          campaign: string | null;
          stage: LeadStage;
          score: LeadScore | null;
          budget_min: number | null;
          budget_max: number | null;
          lost_reason: string | null;
          last_activity_at: string | null;
          next_followup_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["leads"]["Row"]> & { contact_id: string; source: LeadSource };
        Update: Partial<Database["public"]["Tables"]["leads"]["Row"]>;
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          lead_id: string | null;
          deal_id: string | null;
          actor_profile_id: string | null;
          activity_type: ActivityType;
          content: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["activity_log"]["Row"]> & { activity_type: ActivityType };
        Update: Partial<Database["public"]["Tables"]["activity_log"]["Row"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          lead_id: string | null;
          assigned_to: string;
          title: string;
          description: string | null;
          due_at: string;
          status: TaskStatus;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & { assigned_to: string; title: string; due_at: string };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          listing_id: string;
          buyer_contact_id: string;
          seller_contact_id: string | null;
          primary_advisor_id: string;
          stage: DealStage;
          deal_value: number | null;
          commission_percent: number | null;
          commission_amount: number | null;
          commission_split: Record<string, number>;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["deals"]["Row"]> & {
          listing_id: string;
          buyer_contact_id: string;
          primary_advisor_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["deals"]["Row"]>;
        Relationships: [];
      };
      deal_documents: {
        Row: {
          id: string;
          deal_id: string;
          doc_type: DealDocType;
          file_url: string | null;
          status: DealDocStatus;
          uploaded_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["deal_documents"]["Row"]> & { deal_id: string; doc_type: DealDocType };
        Update: Partial<Database["public"]["Tables"]["deal_documents"]["Row"]>;
        Relationships: [];
      };
      automation_rules: {
        Row: {
          id: string;
          trigger_type: AutomationTriggerType;
          config: Record<string, unknown>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["automation_rules"]["Row"]> & { trigger_type: AutomationTriggerType };
        Update: Partial<Database["public"]["Tables"]["automation_rules"]["Row"]>;
        Relationships: [];
      };
      automation_logs: {
        Row: {
          id: string;
          rule_id: string;
          lead_id: string | null;
          deal_id: string | null;
          listing_id: string | null;
          status: AutomationLogStatus;
          payload: Record<string, unknown>;
          executed_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["automation_logs"]["Row"]> & { rule_id: string };
        Update: Partial<Database["public"]["Tables"]["automation_logs"]["Row"]>;
        Relationships: [];
      };
      notification_templates: {
        Row: {
          id: string;
          key: string;
          channel: NotificationChannel;
          subject: string | null;
          body: LocalizedText;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notification_templates"]["Row"]> & { key: string; channel: NotificationChannel };
        Update: Partial<Database["public"]["Tables"]["notification_templates"]["Row"]>;
        Relationships: [];
      };
      saved_searches: {
        Row: {
          id: string;
          contact_id: string | null;
          criteria: Record<string, unknown>;
          alert_channel: AlertChannel;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["saved_searches"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["saved_searches"]["Row"]>;
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          advisor_id: string | null;
          client_name: string;
          rating: number;
          content: LocalizedText | null;
          source: TestimonialSource;
          is_published: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["testimonials"]["Row"]> & { client_name: string; rating: number };
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Row"]>;
        Relationships: [];
      };
      review_summary: {
        Row: {
          id: true;
          google_rating: number | null;
          google_review_count: number | null;
          magicpin_rating: number | null;
          magicpin_review_count: number | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["review_summary"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["review_summary"]["Row"]>;
        Relationships: [];
      };
      page_events: {
        Row: {
          id: string;
          visitor_id: string;
          event_type: PageEventType;
          listing_id: string | null;
          contact_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["page_events"]["Row"]> & { visitor_id: string; event_type: PageEventType };
        Update: Partial<Database["public"]["Tables"]["page_events"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      submit_lead: {
        Args: {
          p_full_name: string;
          p_phone: string;
          p_email?: string | null;
          p_whatsapp_number?: string | null;
          p_listing_id?: string | null;
          p_source?: LeadSource;
          p_source_detail?: string | null;
          p_campaign?: string | null;
          p_message?: string | null;
          p_visitor_id?: string | null;
        };
        Returns: string;
      };
      log_page_event: {
        Args: {
          p_visitor_id: string;
          p_event_type: PageEventType;
          p_listing_id?: string | null;
          p_metadata?: Record<string, unknown>;
        };
        Returns: undefined;
      };
      create_saved_search: {
        Args: {
          p_full_name?: string | null;
          p_phone?: string | null;
          p_email?: string | null;
          p_criteria?: Record<string, unknown>;
          p_alert_channel?: AlertChannel;
          p_visitor_id?: string | null;
        };
        Returns: string;
      };
      merge_contacts: {
        Args: { p_keep_id: string; p_duplicate_id: string };
        Returns: undefined;
      };
      update_lead_stage: {
        Args: { p_lead_id: string; p_new_stage: LeadStage };
        Returns: undefined;
      };
      update_deal_stage: {
        Args: { p_deal_id: string; p_new_stage: DealStage };
        Returns: undefined;
      };
      run_automation_scans: {
        Args: Record<string, never>;
        Returns: Record<string, number>;
      };
      report_lead_funnel: {
        Args: Record<string, never>;
        Returns: { stage: LeadStage; total: number }[];
      };
      report_lead_sources: {
        Args: Record<string, never>;
        Returns: { source: LeadSource; total: number; won: number }[];
      };
      report_leads_over_time: {
        Args: { p_days?: number };
        Returns: { day: string; total: number }[];
      };
      report_deal_summary: {
        Args: Record<string, never>;
        Returns: { stage: DealStage; total: number; total_value: number; total_commission: number }[];
      };
      report_deals_closed_over_time: {
        Args: { p_months?: number };
        Returns: { month: string; total: number; total_value: number }[];
      };
      report_listing_status_breakdown: {
        Args: Record<string, never>;
        Returns: { status: ListingStatus; total: number }[];
      };
      report_listing_segment_breakdown: {
        Args: Record<string, never>;
        Returns: { segment: ListingSegment; total: number }[];
      };
      report_top_viewed_listings: {
        Args: { p_limit?: number };
        Returns: { listing_id: string; title: LocalizedText; views: number }[];
      };
      report_team_performance: {
        Args: Record<string, never>;
        Returns: {
          profile_id: string;
          full_name: string;
          role: ProfileRole;
          leads_assigned: number;
          leads_won: number;
          deals_closed: number;
          revenue: number;
          commission: number;
        }[];
      };
      report_automation_summary: {
        Args: { p_days?: number };
        Returns: { trigger_type: AutomationTriggerType; sent: number; failed: number; pending: number }[];
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
