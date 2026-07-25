import { createClient } from "@/lib/supabase/server";
import { getAutomationRules, getNotificationTemplates } from "@/lib/data/crm/automation";
import { AutomationRuleCard } from "@/components/crm/automation-rule-card";
import { NotificationTemplateEditor } from "@/components/crm/notification-template-editor";

export const dynamic = "force-dynamic";

// RLS (automation_rules_all / notification_templates_all) scopes both
// tables to broker/employee -- anyone else's client just gets back an
// empty array here, which reads as "nothing configured" rather than an
// error. The sidebar also only shows this link to broker/employee (see
// SidebarNav), so this page is effectively unreachable for other roles
// in normal use.
export default async function AutomationSettingsPage() {
  const supabase = await createClient();
  const [rules, templates] = await Promise.all([getAutomationRules(supabase), getNotificationTemplates(supabase)]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Automation</h1>
        <p className="text-sm text-muted-foreground">Configure triggers, timing, and message copy for automated WhatsApp and email follow-ups.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No automation rules configured, or you don&apos;t have access to view them.</p>
        ) : (
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Triggers</h2>
              <div className="flex flex-col gap-3">
                {rules.map((rule) => (
                  <AutomationRuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Message templates</h2>
              <div className="flex flex-col gap-3">
                {templates.map((template) => (
                  <NotificationTemplateEditor key={template.id} template={template} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
