"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// There's deliberately no separate "bootstrap" screen: whoever
// successfully authenticates first (sign-in or sign-up) attempts
// bootstrap_first_super_admin(), which is a harmless no-op for everyone
// after the very first admin -- see ARCHITECTURE.md, Step 10. Access
// control for *who can even reach this page* is a platform-operator
// concern (e.g. disabling public sign-ups on the Supabase Auth settings
// once the first admin exists), not something this UI can enforce.
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function afterAuth(supabase: ReturnType<typeof createClient>) {
    try {
      await supabase.rpc("bootstrap_first_super_admin", { p_full_name: fullName || null });
    } catch {
      // Not the first admin -- expected and fine.
    }
    router.push(searchParams.get("next") || "/admin");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        setSubmitting(false);
        return;
      }
      await afterAuth(supabase);
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }
    if (!data.session) {
      setCheckEmail(true);
      setSubmitting(false);
      return;
    }
    await afterAuth(supabase);
  }

  if (checkEmail) {
    return (
      <p className="text-sm text-muted-foreground">
        Check your email to confirm your account, then come back and sign in -- if you&apos;re the first admin, you&apos;ll be set up
        automatically.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === "signup" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
      </Button>
      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="text-xs text-muted-foreground underline hover:text-foreground"
      >
        {mode === "signin" ? "First time here? Create the admin account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Platform Admin</CardTitle>
          <CardDescription>Broker instance registry &amp; provisioning.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
