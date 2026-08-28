"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Radix Select renders no native <select>/<input>, so a value picked here wouldn't
// appear in `new FormData(form)` on submit -- this pairs it with a hidden input that
// mirrors the controlled value, which is what the surrounding <form> actually reads.
export function EnumSelect({
  name,
  value,
  onChange,
  options,
  labels,
  placeholder,
  allowEmpty,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  labels?: Record<string, string>;
  placeholder?: string;
  allowEmpty?: boolean;
}) {
  const NONE = "__none__";

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select
        value={value === "" ? NONE : value}
        onValueChange={(next) => onChange(next === NONE ? "" : next)}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder ?? "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty ? <SelectItem value={NONE}>None</SelectItem> : null}
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {labels?.[option] ?? option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
