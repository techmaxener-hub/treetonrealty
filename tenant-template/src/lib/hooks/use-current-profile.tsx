"use client";

import { createContext, useContext } from "react";
import type { Tables } from "@/lib/types/database";

export type CurrentProfile = Pick<Tables<"profiles">, "id" | "role" | "full_name" | "avatar_url"> & {
  advisorProfileId: string | null;
};

const CurrentProfileContext = createContext<CurrentProfile | null>(null);

export function CurrentProfileProvider({
  profile,
  children,
}: {
  profile: CurrentProfile;
  children: React.ReactNode;
}) {
  return <CurrentProfileContext.Provider value={profile}>{children}</CurrentProfileContext.Provider>;
}

export function useCurrentProfile() {
  const ctx = useContext(CurrentProfileContext);
  if (!ctx) throw new Error("useCurrentProfile must be used within CurrentProfileProvider");
  return ctx;
}

export function canManage(role: CurrentProfile["role"]) {
  return role === "broker" || role === "employee";
}
