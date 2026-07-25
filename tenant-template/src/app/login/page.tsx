import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/crm/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Sign in</CardTitle>
          <CardDescription>Use the email your broker invited you with.</CardDescription>
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
