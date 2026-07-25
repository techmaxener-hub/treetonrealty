import nodemailer from "nodemailer";
import type { SendResult } from "@/lib/automation/providers/whatsapp";

// SMTP is deliberately the only email path -- it's the one option that
// works with literally any provider (Gmail, SES, SendGrid, Postmark, a
// broker's own mail server) without picking a vendor SDK, matching how
// the brief itself frames "SMTP/email sending credentials" as the
// placeholder. Same dry-run fallback as WhatsApp when unconfigured.

let cachedTransport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransport() {
  if (cachedTransport) return cachedTransport;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;

  cachedTransport = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
  return cachedTransport;
}

export async function sendEmail(to: string, subject: string, body: string): Promise<SendResult> {
  const transport = getTransport();
  const from = process.env.SMTP_FROM;

  if (!transport || !from) {
    console.log(`[automation:email:dry-run] to=${to} subject=${JSON.stringify(subject)} body=${JSON.stringify(body)}`);
    return { success: true, providerMessageId: "dry-run" };
  }

  try {
    const info = await transport.sendMail({ from, to, subject, text: body });
    return { success: true, providerMessageId: info.messageId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
