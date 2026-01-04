import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { BillingSection } from "@/components/settings/BillingSection";
import { requireAuth } from "@/lib/auth";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how FocusFlow looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Suspense fallback={<Card><CardContent className="p-6">Loading billing...</CardContent></Card>}>
        <BillingSection userId={user.id} />
      </Suspense>
    </div>
  );
}
