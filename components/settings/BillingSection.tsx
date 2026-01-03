import { getUserPlan } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createPortalSession } from "@/app/actions/billing";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export async function BillingSection({ userId }: { userId: string }) {
  const plan = await getUserPlan(userId);

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["active", "trialing"],
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>
          Manage your subscription and billing details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Current plan: <span className="font-semibold text-foreground">{plan}</span>
          </p>
        </div>

        {plan === "FREE" && (
          <div>
            <h3 className="font-semibold mb-2">Free Plan Includes:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Up to 3 projects</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Unlimited tasks per project</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/pricing">
                <Button>Upgrade to Plus</Button>
              </Link>
            </div>
          </div>
        )}

        {plan === "PLUS" && subscription && (
          <div>
            <h3 className="font-semibold mb-2">Plus Plan Includes:</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Unlimited projects</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Unlimited tasks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Priority support</span>
              </li>
            </ul>
            {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd ? (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                <p className="text-sm font-semibold text-orange-900">Subscription Ending</p>
                <p className="text-sm text-orange-700 mt-1">
                  Your Plus plan will end on{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                <p className="text-xs text-orange-600 mt-2">
                  You&apos;ll keep Plus benefits until then. After that, you&apos;ll return to the Free plan.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-lg mb-4">
                <p className="text-sm font-medium">Subscription Status</p>
                <p className="text-sm text-muted-foreground capitalize">{subscription.status}</p>
                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
            <form action={createPortalSession}>
              <Button type="submit">Manage Subscription</Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
