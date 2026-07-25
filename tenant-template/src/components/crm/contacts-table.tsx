"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { ContactListItem } from "@/lib/data/contacts";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AddContactDialog } from "@/components/crm/add-contact-dialog";
import { MergeDuplicateAction } from "@/components/crm/merge-duplicate-action";
import { useCurrentProfile, canManage } from "@/lib/hooks/use-current-profile";

export function ContactsTable({ contacts }: { contacts: ContactListItem[] }) {
  const profile = useCurrentProfile();
  const [query, setQuery] = useState("");
  const contactById = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) => c.full_name.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q),
    );
  }, [contacts, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Contacts</h1>
          <p className="text-sm text-muted-foreground">Buyers, sellers, tenants, landlords, and past clients.</p>
        </div>
        {canManage(profile.role) && <AddContactDialog />}
      </div>

      <div className="px-6 py-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name, phone, email…" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Flags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((contact) => {
              const original = contact.potential_duplicate_of ? contactById.get(contact.potential_duplicate_of) : null;
              return (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Link href={`/crm/contacts/${contact.id}`} className="font-medium hover:underline">
                      {contact.full_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{contact.phone ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.contact_type.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px] capitalize">
                          {t.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{contact.leadCount}</TableCell>
                  <TableCell>
                    {original ? (
                      <MergeDuplicateAction
                        duplicateId={contact.id}
                        duplicateName={contact.full_name}
                        originalId={original.id}
                        originalName={original.full_name}
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
