"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createLocality, type LocalityLite } from "@/lib/data/localities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NONE = "__none__";
const NEW = "__new__";

export function LocalitySelect({
  localities,
  value,
  onChange,
  onLocalityCreated,
}: {
  localities: LocalityLite[];
  value: string | null;
  onChange: (id: string | null) => void;
  onLocalityCreated: (locality: LocalityLite) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!newName.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    try {
      const locality = await createLocality(supabase, newName.trim());
      onLocalityCreated(locality);
      onChange(locality.id);
      setAdding(false);
      setNewName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add locality");
    }
    setSubmitting(false);
  }

  if (adding) {
    return (
      <div className="flex gap-2">
        <Input
          autoFocus
          placeholder="Locality name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreate())}
        />
        <Button type="button" size="sm" onClick={handleCreate} disabled={submitting || !newName.trim()}>
          Add
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={value ?? NONE}
      onValueChange={(v) => {
        if (v === NEW) setAdding(true);
        else onChange(v === NONE ? null : v);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="No locality" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>No locality</SelectItem>
        {localities.map((l) => (
          <SelectItem key={l.id} value={l.id}>
            {l.name}
          </SelectItem>
        ))}
        <SelectItem value={NEW}>
          <span className="flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Add locality…
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
