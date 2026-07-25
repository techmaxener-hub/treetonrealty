import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, LocalizedText } from "@/lib/types/database";
import { getTemplate, renderTemplate } from "@/lib/automation/templates";
import { sendWhatsAppMessage } from "@/lib/automation/providers/whatsapp";
import { sendEmail } from "@/lib/automation/providers/email";
import { localizedText, formatCurrencyINR } from "@/lib/utils";

type Ctx = { supabase: SupabaseClient<Database>; brokerName: string; language: "en" | "hi" | "gu" };
type Recipient = { full_name?: string; phone?: string | null; email?: string | null };
type Outcome = { success: boolean; detail: Record<string, unknown> };

async function sendViaTemplateKey(ctx: Ctx, key: string, recipient: Recipient, variables: Record<string, string>): Promise<Outcome> {
  const template = await getTemplate(ctx.supabase, key);
  if (!template) return { success: false, detail: { key, error: "template not found" } };

  const rendered = renderTemplate(template.body as LocalizedText, ctx.language, variables);

  if (template.channel === "whatsapp") {
    if (!recipient.phone) return { success: false, detail: { key, channel: "whatsapp", error: "no phone on file" } };
    const result = await sendWhatsAppMessage(recipient.phone, rendered);
    return { success: result.success, detail: { key, channel: "whatsapp", ...result } };
  }

  if (template.channel === "email") {
    if (!recipient.email) return { success: false, detail: { key, channel: "email", error: "no email on file" } };
    const result = await sendEmail(recipient.email, template.subject ?? ctx.brokerName, rendered);
    return { success: result.success, detail: { key, channel: "email", ...result } };
  }

  return { success: false, detail: { key, error: `unsupported channel "${template.channel}"` } };
}

async function getContact(ctx: Ctx, contactId: string) {
  const { data } = await ctx.supabase.from("contacts").select("*").eq("id", contactId).maybeSingle();
  return data;
}

async function getListingTitle(ctx: Ctx, listingId: string | null) {
  if (!listingId) return "";
  const { data } = await ctx.supabase.from("listings").select("title").eq("id", listingId).maybeSingle();
  return data ? localizedText(data.title as LocalizedText, ctx.language) : "";
}

async function getAssignedOrBrokerContact(ctx: Ctx, assignedProfileId: string | null): Promise<Recipient | null> {
  if (assignedProfileId) {
    const { data } = await ctx.supabase.from("profiles").select("full_name, phone, email").eq("id", assignedProfileId).maybeSingle();
    if (data) return data;
  }
  const { data } = await ctx.supabase.from("profiles").select("full_name, phone, email").eq("role", "broker").maybeSingle();
  return data;
}

// ── Handlers, one per automation_trigger_type ──────────────────────────
// Each returns whether the automation_logs row counts as "sent" (at
// least one message went out) or "failed" (none did); per-channel detail
// always gets recorded in the row's payload either way, so a partial
// failure -- e.g. lead has no email on file -- is visible without being
// treated as a hard failure of the whole automation.

async function handleNewLead(ctx: Ctx, log: Tables<"automation_logs">): Promise<Outcome> {
  if (!log.lead_id) return { success: false, detail: { error: "missing lead_id" } };
  const { data: lead } = await ctx.supabase.from("leads").select("*").eq("id", log.lead_id).maybeSingle();
  if (!lead) return { success: false, detail: { error: "lead not found" } };
  const contact = await getContact(ctx, lead.contact_id);
  if (!contact) return { success: false, detail: { error: "contact not found" } };

  const listingTitle = await getListingTitle(ctx, lead.listing_id);
  const listingContext = listingTitle ? ` about ${listingTitle}` : "";
  const leadVars = { full_name: contact.full_name, broker_name: ctx.brokerName, listing_context: listingContext };

  const ack = await sendViaTemplateKey(ctx, "lead_ack_whatsapp", contact, leadVars);
  const ackEmail = await sendViaTemplateKey(ctx, "lead_ack_email", contact, leadVars);

  const agent = await getAssignedOrBrokerContact(ctx, lead.assigned_advisor_id);
  const alert = agent
    ? await sendViaTemplateKey(ctx, "agent_new_lead_alert", agent, {
        full_name: contact.full_name,
        phone: contact.phone ?? "",
        source: lead.source,
        listing_context: listingContext,
      })
    : { success: false, detail: { error: "no agent or broker profile found" } };

  return {
    success: ack.success || ackEmail.success || alert.success,
    detail: { lead_ack_whatsapp: ack.detail, lead_ack_email: ackEmail.detail, agent_alert: alert.detail },
  };
}

async function handleNoResponseSla(ctx: Ctx, log: Tables<"automation_logs">): Promise<Outcome> {
  if (!log.lead_id) return { success: false, detail: { error: "missing lead_id" } };
  const { data: lead } = await ctx.supabase.from("leads").select("*").eq("id", log.lead_id).maybeSingle();
  if (!lead) return { success: false, detail: { error: "lead not found" } };
  const contact = await getContact(ctx, lead.contact_id);
  if (!contact) return { success: false, detail: { error: "contact not found" } };

  const agent = await getAssignedOrBrokerContact(ctx, lead.assigned_advisor_id);
  if (!agent) return { success: false, detail: { error: "no agent or broker profile found" } };

  const result = await sendViaTemplateKey(ctx, "sla_nudge_agent", agent, {
    full_name: contact.full_name,
    phone: contact.phone ?? "",
    created_at: new Date(lead.created_at).toLocaleString("en-IN"),
  });
  return { success: result.success, detail: result.detail };
}

async function handleDripSequence(ctx: Ctx, log: Tables<"automation_logs">): Promise<Outcome> {
  if (!log.lead_id) return { success: false, detail: { error: "missing lead_id" } };
  const { data: lead } = await ctx.supabase.from("leads").select("*").eq("id", log.lead_id).maybeSingle();
  if (!lead) return { success: false, detail: { error: "lead not found" } };
  const contact = await getContact(ctx, lead.contact_id);
  if (!contact) return { success: false, detail: { error: "contact not found" } };

  const listingTitle = await getListingTitle(ctx, lead.listing_id);
  const result = await sendViaTemplateKey(ctx, "drip_followup", contact, {
    full_name: contact.full_name,
    listing_context: listingTitle ? ` in ${listingTitle}` : "",
    day: String((log.payload as { day_offset?: number })?.day_offset ?? ""),
  });
  return { success: result.success, detail: result.detail };
}

async function handleNewListingMatch(ctx: Ctx, log: Tables<"automation_logs">): Promise<Outcome> {
  const payload = log.payload as { contact_id?: string };
  if (!log.listing_id || !payload.contact_id) return { success: false, detail: { error: "missing listing_id or contact_id" } };
  const contact = await getContact(ctx, payload.contact_id);
  if (!contact) return { success: false, detail: { error: "contact not found" } };
  const { data: listing } = await ctx.supabase.from("listings").select("*").eq("id", log.listing_id).maybeSingle();
  if (!listing) return { success: false, detail: { error: "listing not found" } };

  const result = await sendViaTemplateKey(ctx, "new_listing_match", contact, {
    full_name: contact.full_name,
    listing_title: localizedText(listing.title as LocalizedText, ctx.language),
    price: formatCurrencyINR(listing.price),
  });
  return { success: result.success, detail: result.detail };
}

async function handlePostSiteVisit(ctx: Ctx, log: Tables<"automation_logs">): Promise<Outcome> {
  if (!log.lead_id) return { success: false, detail: { error: "missing lead_id" } };
  const { data: lead } = await ctx.supabase.from("leads").select("*").eq("id", log.lead_id).maybeSingle();
  if (!lead) return { success: false, detail: { error: "lead not found" } };
  const contact = await getContact(ctx, lead.contact_id);
  if (!contact) return { success: false, detail: { error: "contact not found" } };

  const listingTitle = await getListingTitle(ctx, lead.listing_id);
  const result = await sendViaTemplateKey(ctx, "post_site_visit_feedback", contact, {
    full_name: contact.full_name,
    listing_title: listingTitle || "the property",
  });
  return { success: result.success, detail: result.detail };
}

async function handlePostClosing(ctx: Ctx, log: Tables<"automation_logs">): Promise<Outcome> {
  if (!log.deal_id) return { success: false, detail: { error: "missing deal_id" } };
  const { data: deal } = await ctx.supabase.from("deals").select("*").eq("id", log.deal_id).maybeSingle();
  if (!deal) return { success: false, detail: { error: "deal not found" } };
  const contact = await getContact(ctx, deal.buyer_contact_id);
  if (!contact) return { success: false, detail: { error: "buyer contact not found" } };

  const result = await sendViaTemplateKey(ctx, "post_closing_review_request", contact, {
    full_name: contact.full_name,
    broker_name: ctx.brokerName,
  });
  return { success: result.success, detail: result.detail };
}

async function handleAbandonedBrowse(ctx: Ctx, log: Tables<"automation_logs">): Promise<Outcome> {
  const payload = log.payload as { contact_id?: string; view_count?: number };
  if (!payload.contact_id) return { success: false, detail: { error: "missing contact_id" } };
  const contact = await getContact(ctx, payload.contact_id);
  if (!contact) return { success: false, detail: { error: "contact not found" } };

  // Email only, deliberately -- the real-time WhatsApp prompt for this
  // same behavior is the client-side widget (see ARCHITECTURE.md); this
  // is specifically the "retarget by email if captured" half.
  const result = await sendViaTemplateKey(ctx, "abandoned_browse_retarget_email", contact, {
    full_name: contact.full_name,
    broker_name: ctx.brokerName,
  });
  return { success: result.success, detail: result.detail };
}

async function handleBirthdayAnniversary(ctx: Ctx, log: Tables<"automation_logs">): Promise<Outcome> {
  const payload = log.payload as { contact_id?: string; occasion?: "birthday" | "anniversary" };
  if (!payload.contact_id || !payload.occasion) return { success: false, detail: { error: "missing contact_id or occasion" } };
  const contact = await getContact(ctx, payload.contact_id);
  if (!contact) return { success: false, detail: { error: "contact not found" } };

  const key = payload.occasion === "birthday" ? "birthday_greeting" : "anniversary_greeting";
  const result = await sendViaTemplateKey(ctx, key, contact, { full_name: contact.full_name, broker_name: ctx.brokerName });
  return { success: result.success, detail: result.detail };
}

async function handlePriceDropStatusChange(ctx: Ctx, log: Tables<"automation_logs">): Promise<Outcome> {
  if (!log.lead_id || !log.listing_id) return { success: false, detail: { error: "missing lead_id or listing_id" } };
  const { data: lead } = await ctx.supabase.from("leads").select("*").eq("id", log.lead_id).maybeSingle();
  if (!lead) return { success: false, detail: { error: "lead not found" } };
  const contact = await getContact(ctx, lead.contact_id);
  if (!contact) return { success: false, detail: { error: "contact not found" } };

  const listingTitle = await getListingTitle(ctx, log.listing_id);
  const payload = log.payload as { old_price?: number; new_price?: number; old_status?: string; new_status?: string };
  const summary =
    payload.new_price && payload.old_price && payload.new_price < payload.old_price
      ? `now ${formatCurrencyINR(payload.new_price)} (was ${formatCurrencyINR(payload.old_price)})`
      : payload.new_status && payload.new_status !== payload.old_status
        ? `status changed to ${payload.new_status.replace("_", " ")}`
        : "there's an update";

  const result = await sendViaTemplateKey(ctx, "listing_update_alert", contact, {
    full_name: contact.full_name,
    listing_title: listingTitle || "the property",
    update_summary: summary,
  });
  return { success: result.success, detail: result.detail };
}

const HANDLERS: Record<string, (ctx: Ctx, log: Tables<"automation_logs">) => Promise<Outcome>> = {
  new_lead: handleNewLead,
  no_response_sla: handleNoResponseSla,
  drip_sequence: handleDripSequence,
  new_listing_match: handleNewListingMatch,
  post_site_visit: handlePostSiteVisit,
  post_closing: handlePostClosing,
  abandoned_browse: handleAbandonedBrowse,
  birthday_anniversary: handleBirthdayAnniversary,
  price_drop_status_change: handlePriceDropStatusChange,
};

export async function dispatchPendingAutomations(supabase: SupabaseClient<Database>, limit = 50) {
  const { data: pending, error } = await supabase
    .from("automation_logs")
    .select("*")
    .eq("status", "pending")
    .order("executed_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  if (!pending?.length) return { processed: 0, sent: 0, failed: 0 };

  const { data: broker } = await supabase.from("broker_profile").select("display_name, default_language").maybeSingle();
  const ctx: Ctx = {
    supabase,
    brokerName: broker?.display_name ?? "our team",
    language: (broker?.default_language as Ctx["language"]) ?? "en",
  };

  const ruleIds = [...new Set(pending.map((p) => p.rule_id))];
  const { data: rules } = await supabase.from("automation_rules").select("id, trigger_type").in("id", ruleIds);
  const ruleById = new Map((rules ?? []).map((r) => [r.id, r]));

  let sent = 0;
  let failed = 0;

  for (const log of pending) {
    const rule = ruleById.get(log.rule_id);
    const handler = rule ? HANDLERS[rule.trigger_type] : undefined;

    let outcome: Outcome;
    if (!handler) {
      outcome = { success: false, detail: { error: rule ? `no handler for "${rule.trigger_type}"` : "rule not found" } };
    } else {
      try {
        outcome = await handler(ctx, log);
      } catch (err) {
        outcome = { success: false, detail: { error: err instanceof Error ? err.message : String(err) } };
      }
    }

    await supabase
      .from("automation_logs")
      .update({
        status: outcome.success ? "sent" : "failed",
        payload: { ...(log.payload as Record<string, unknown>), result: outcome.detail },
      })
      .eq("id", log.id);

    if (outcome.success) sent++;
    else failed++;
  }

  return { processed: pending.length, sent, failed };
}
