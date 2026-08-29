import { TeamMemberForm } from "../team-form";

export default function NewTeamMemberPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-deep">Add Team Member</h1>
        <p className="text-sm text-muted-foreground">
          Save the basics first -- you can add a photo right after. Leave &quot;Published&quot;
          unchecked to keep this profile off the public About page until it&apos;s ready.
        </p>
      </div>
      <TeamMemberForm />
    </div>
  );
}
