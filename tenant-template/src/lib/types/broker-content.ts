// Shapes for the broker_profile jsonb columns. Not enforced by the
// database (jsonb has no schema), so treat these as "what the CRM writes
// and the site reads," not a guarantee -- optional-chain every field.

export type BrokerContact = {
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  address?: string;
  office_lat?: number;
  office_lng?: number;
};

export type BrokerSocialLinks = {
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  facebook?: string;
  google_business_url?: string;
  magicpin_url?: string;
};

export type BrokerBranding = {
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font?: string;
};

export type BrokerSeo = {
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
};
