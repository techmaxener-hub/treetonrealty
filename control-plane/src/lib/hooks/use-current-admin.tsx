"use client";

import { createContext, useContext } from "react";
import type { Tables } from "@/lib/types/database";

export type CurrentAdmin = Pick<Tables<"platform_admins">, "id" | "email" | "name" | "role">;

const CurrentAdminContext = createContext<CurrentAdmin | null>(null);

export function CurrentAdminProvider({ admin, children }: { admin: CurrentAdmin; children: React.ReactNode }) {
  return <CurrentAdminContext.Provider value={admin}>{children}</CurrentAdminContext.Provider>;
}

export function useCurrentAdmin() {
  const ctx = useContext(CurrentAdminContext);
  if (!ctx) throw new Error("useCurrentAdmin must be used within CurrentAdminProvider");
  return ctx;
}

export function isSuperAdmin(role: CurrentAdmin["role"]) {
  return role === "super_admin";
}
