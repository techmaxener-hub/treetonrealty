"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LANGUAGES } from "@/lib/constants";
import type { LocalizedText } from "@/lib/types/database";

export function LocalizedField({
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const Field = multiline ? Textarea : Input;

  return (
    <Tabs defaultValue="en">
      <TabsList>
        {LANGUAGES.map((lang) => (
          <TabsTrigger key={lang.value} value={lang.value}>
            {lang.label}
            {value[lang.value] ? " ✓" : ""}
          </TabsTrigger>
        ))}
      </TabsList>
      {LANGUAGES.map((lang) => (
        <TabsContent key={lang.value} value={lang.value}>
          <Field
            value={value[lang.value] ?? ""}
            onChange={(e) => onChange({ ...value, [lang.value]: e.target.value })}
            placeholder={lang.value === "en" ? placeholder : `${placeholder ?? ""} (${lang.label})`}
            rows={multiline ? 4 : undefined}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
