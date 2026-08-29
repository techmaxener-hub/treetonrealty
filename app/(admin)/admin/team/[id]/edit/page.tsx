import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMemberForm } from "../../team-form";
import { TeamPhotoUploader } from "../../team-photo-uploader";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: member } = await supabase.from("team_members").select("*").eq("id", id).single();

  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-8 pb-12">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-deep">{member.full_name}</h1>
        <p className="text-sm text-muted-foreground">{member.role}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamPhotoUploader
            memberId={id}
            photoStoragePath={member.photo_storage_path}
            photoAltText={member.photo_alt_text}
            fullName={member.full_name}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamMemberForm member={member} />
        </CardContent>
      </Card>
    </div>
  );
}
