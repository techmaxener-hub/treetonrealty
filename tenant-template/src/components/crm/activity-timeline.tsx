import { formatDistanceToNow } from "date-fns";
import { Phone, MessageCircle, Mail, StickyNote, MapPin, ArrowRightLeft, CheckSquare } from "lucide-react";
import type { Tables } from "@/lib/types/database";
import type { ActivityType } from "@/lib/types/database";

const ICONS: Record<ActivityType, typeof Phone> = {
  call: Phone,
  whatsapp_message: MessageCircle,
  email: Mail,
  note: StickyNote,
  site_visit: MapPin,
  status_change: ArrowRightLeft,
  task: CheckSquare,
};

const LABELS: Record<ActivityType, string> = {
  call: "Call",
  whatsapp_message: "WhatsApp",
  email: "Email",
  note: "Note",
  site_visit: "Site visit",
  status_change: "Stage change",
  task: "Task",
};

export function ActivityTimeline({
  activity,
  profileNameById,
}: {
  activity: Tables<"activity_log">[];
  profileNameById: Map<string, string>;
}) {
  if (activity.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No activity logged yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {activity.map((entry) => {
        const Icon = ICONS[entry.activity_type];
        return (
          <li key={entry.id} className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{LABELS[entry.activity_type]}</span>
                <span className="text-xs text-muted-foreground">
                  {entry.actor_profile_id ? profileNameById.get(entry.actor_profile_id) ?? "Someone" : "System"} ·{" "}
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </span>
              </div>
              {entry.content ? <p className="mt-0.5 text-sm text-muted-foreground">{entry.content}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
