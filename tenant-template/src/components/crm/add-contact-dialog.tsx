"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import type { ContactTypeEnum } from "@/lib/types/database";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CONTACT_TYPES: { value: ContactTypeEnum; label: string }[] = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "tenant", label: "Tenant" },
  { value: "landlord", label: "Landlord" },
  { value: "past_client", label: "Past client" },
];

// Standalone contact creation (no lead attached) is a broker/employee
// action -- see ARCHITECTURE.md on the RLS + RETURNING interaction that
// makes this the safe boundary rather than an arbitrary restriction.
export function AddContactDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactType, setContactType] = useState<ContactTypeEnum>("buyer");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("contacts").insert({
      full_name: fullName,
      phone: phone || null,
      email: email || null,
      contact_type: [contactType],
    });

    if (error) {
      toast.error(`Couldn't add contact: ${error.message}`);
    } else {
      toast.success("Contact added");
      setFullName("");
      setPhone("");
      setEmail("");
      setOpen(false);
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add contact</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact_full_name">Name</Label>
            <Input id="contact_full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact_phone">Phone</Label>
              <Input id="contact_phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact_email">Email</Label>
              <Input id="contact_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select value={contactType} onValueChange={(v) => setContactType(v as ContactTypeEnum)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !fullName.trim()}>
              {submitting ? "Adding…" : "Add contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
