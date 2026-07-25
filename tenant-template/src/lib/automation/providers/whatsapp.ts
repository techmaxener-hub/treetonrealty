// Provider-agnostic WhatsApp send layer. The broker's actual WhatsApp
// Business number and provider credentials are placeholders (env vars)
// per the brief -- this file is the generic integration layer any
// provider plugs into, not a specific vendor's SDK.
//
// WHATSAPP_PROVIDER selects the adapter:
//   "meta_cloud"       -- official Meta WhatsApp Cloud API
//   "generic_webhook"  -- posts {to, message} to a configurable URL,
//                         for providers like Interakt/Gupshup whose
//                         send-message endpoint accepts a simple POST
//                         (point WHATSAPP_WEBHOOK_URL at the provider's
//                         endpoint, or at a small translator you run)
//   unset              -- dry-run: logs to the console and reports
//                         success, so the rest of the pipeline (queueing,
//                         templating, retries, CRM status) is fully
//                         exercisable before a broker has real
//                         credentials to hand.

export type SendResult = { success: boolean; error?: string; providerMessageId?: string };

export async function sendWhatsAppMessage(to: string, message: string): Promise<SendResult> {
  const provider = process.env.WHATSAPP_PROVIDER;

  if (!provider) {
    console.log(`[automation:whatsapp:dry-run] to=${to} message=${JSON.stringify(message)}`);
    return { success: true, providerMessageId: "dry-run" };
  }

  if (provider === "meta_cloud") return sendViaMetaCloud(to, message);
  if (provider === "generic_webhook") return sendViaGenericWebhook(to, message);

  return { success: false, error: `Unknown WHATSAPP_PROVIDER "${provider}"` };
}

async function sendViaMetaCloud(to: string, message: string): Promise<SendResult> {
  const token = process.env.WHATSAPP_META_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_META_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return { success: false, error: "WHATSAPP_META_ACCESS_TOKEN / WHATSAPP_META_PHONE_NUMBER_ID not configured" };
  }

  const digits = to.replace(/[^0-9]/g, "");
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: digits,
      type: "text",
      text: { body: message },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { success: false, error: `Meta Cloud API ${res.status}: ${body.slice(0, 300)}` };
  }

  const json = (await res.json()) as { messages?: { id?: string }[] };
  return { success: true, providerMessageId: json.messages?.[0]?.id };
}

async function sendViaGenericWebhook(to: string, message: string): Promise<SendResult> {
  const url = process.env.WHATSAPP_WEBHOOK_URL;
  const apiKey = process.env.WHATSAPP_WEBHOOK_API_KEY;
  if (!url) return { success: false, error: "WHATSAPP_WEBHOOK_URL not configured" };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({ to, message }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { success: false, error: `Webhook ${res.status}: ${body.slice(0, 300)}` };
  }

  return { success: true };
}
