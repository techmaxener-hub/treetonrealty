-- Automation engine, part 2: default rules + notification copy.
--
-- "Wire every workflow... nothing else should be a stub" only holds if
-- there's something here to fire on day one -- an engine with no active
-- rules and no template copy is still a stub, just a more elaborate one.
-- These are real, usable defaults; the CRM's Automation settings page
-- lets a broker retune intervals/SLA or rewrite the copy without a
-- migration. Broker-identifying values (their name, listing links) are
-- {{template variables}} filled in at send time, never hardcoded here.

insert into automation_rules (trigger_type, config, is_active) values
  ('new_lead', '{}'::jsonb, true),
  ('no_response_sla', '{"sla_hours": 4}'::jsonb, true),
  ('drip_sequence', '{"interval_days": [1, 3, 7]}'::jsonb, true),
  ('new_listing_match', '{}'::jsonb, true),
  ('post_site_visit', '{}'::jsonb, true),
  ('post_closing', '{}'::jsonb, true),
  ('abandoned_browse', '{"min_views": 3, "window_hours": 48}'::jsonb, true),
  ('birthday_anniversary', '{}'::jsonb, true),
  ('price_drop_status_change', '{}'::jsonb, true);

insert into notification_templates (key, channel, subject, body) values
  (
    'lead_ack_whatsapp', 'whatsapp', null,
    '{
      "en": "Hi {{full_name}}, thanks for reaching out to {{broker_name}}! We''ve received your enquiry{{listing_context}} and someone from our team will call you shortly.",
      "hi": "नमस्ते {{full_name}}, {{broker_name}} से संपर्क करने के लिए धन्यवाद! हमें आपकी पूछताछ{{listing_context}} मिल गई है और हमारी टीम से कोई जल्द ही आपको कॉल करेगा।",
      "gu": "નમસ્તે {{full_name}}, {{broker_name}}નો સંપર્ક કરવા બદલ આભાર! અમને તમારી પૂછપરછ{{listing_context}} મળી ગઈ છે અને અમારી ટીમમાંથી કોઈ ટૂંક સમયમાં તમને કૉલ કરશે."
    }'::jsonb
  ),
  (
    'lead_ack_email', 'email', 'We received your enquiry — {{broker_name}}',
    '{
      "en": "Hi {{full_name}},\n\nThanks for reaching out to {{broker_name}}{{listing_context}}. Someone from our team will be in touch shortly.\n\nIn the meantime, feel free to reply to this email or reach us on WhatsApp.\n\n— {{broker_name}}",
      "hi": "नमस्ते {{full_name}},\n\n{{broker_name}} से संपर्क करने के लिए धन्यवाद{{listing_context}}। हमारी टीम से कोई जल्द ही आपसे संपर्क करेगा।\n\n— {{broker_name}}",
      "gu": "નમસ્તે {{full_name}},\n\n{{broker_name}}નો સંપર્ક કરવા બદલ આભાર{{listing_context}}. અમારી ટીમમાંથી કોઈ ટૂંક સમયમાં તમારો સંપર્ક કરશે.\n\n— {{broker_name}}"
    }'::jsonb
  ),
  (
    'agent_new_lead_alert', 'whatsapp', null,
    '{"en": "New lead: {{full_name}} ({{phone}}), source: {{source}}{{listing_context}}. Assigned to you -- follow up soon."}'::jsonb
  ),
  (
    'sla_nudge_agent', 'whatsapp', null,
    '{"en": "Reminder: {{full_name}} ({{phone}}) has been waiting since {{created_at}} with no contact logged yet. Please follow up."}'::jsonb
  ),
  (
    'drip_followup', 'whatsapp', null,
    '{"en": "Hi {{full_name}}, just checking in -- are you still looking{{listing_context}}? Happy to help with anything you need, whenever suits you."}'::jsonb
  ),
  (
    'new_listing_match', 'whatsapp', null,
    '{"en": "Hi {{full_name}}, a new listing just went live that matches what you''re looking for: {{listing_title}} at {{price}}. Want details?"}'::jsonb
  ),
  (
    'post_site_visit_feedback', 'whatsapp', null,
    '{"en": "Hi {{full_name}}, thanks for visiting {{listing_title}} today! How did it go -- any questions, or would you like to see anything similar?"}'::jsonb
  ),
  (
    'post_closing_review_request', 'whatsapp', null,
    '{"en": "Hi {{full_name}}, congratulations again on closing! If you had a good experience with {{broker_name}}, a quick Google review would mean a lot -- and we love referrals too."}'::jsonb
  ),
  (
    'abandoned_browse_retarget_email', 'email', 'Still deciding? We''re here to help — {{broker_name}}',
    '{"en": "Hi {{full_name}},\n\nWe noticed you''ve been browsing a few properties with us. If you''d like a hand narrowing things down, or want to see any of them in person, just reply to this email or reach us on WhatsApp.\n\n— {{broker_name}}"}'::jsonb
  ),
  (
    'birthday_greeting', 'whatsapp', null,
    '{"en": "Happy birthday, {{full_name}}! Wishing you a wonderful year ahead, from all of us at {{broker_name}}."}'::jsonb
  ),
  (
    'anniversary_greeting', 'whatsapp', null,
    '{"en": "Happy anniversary, {{full_name}}! Wishing you both continued happiness, from {{broker_name}}."}'::jsonb
  ),
  (
    'listing_update_alert', 'whatsapp', null,
    '{"en": "Update on {{listing_title}}: {{update_summary}}. Still interested? Let us know if you''d like to revisit it."}'::jsonb
  );
