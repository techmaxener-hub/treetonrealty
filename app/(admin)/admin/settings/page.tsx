import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: settings, error } = await supabase.from("site_settings").select("*").single();

  return (
    <div className="max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-deep">Site Settings</h1>
        <p className="text-sm text-muted-foreground">
          Contact details, compliance info, and homepage stats shown across the public site.
        </p>
      </div>

      {error || !settings ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load site settings: {error?.message ?? "not found"}
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-sans text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsForm settings={settings} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
