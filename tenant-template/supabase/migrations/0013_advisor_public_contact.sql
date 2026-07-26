-- Per-agent public contact info, opt-in. advisor_profiles already models
-- "an agent's own mini-profile" (bio, specialization, photo...) but had
-- no way to surface a direct number -- every public CTA fell back to the
-- broker's single business WhatsApp/phone (Step 6/7 decision). That's
-- still the default; these columns let a broker additionally publish an
-- individual agent's own line, which is normal practice for real estate
-- agents and is what a per-listing "Call this agent" card needs to be
-- real contact info rather than a decorative name badge.

alter table advisor_profiles add column public_phone text;
alter table advisor_profiles add column public_whatsapp text;
