import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getAuthUser } from "@/lib/auth";
import { createCheckout } from "@/app/actions/billing";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const user = await getAuthUser();

  const STRIPE_PRICE_ID_PLUS = process.env.STRIPE_PRICE_ID_PLUS
 || "";

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            FocusFlow
          </Link>
          <div>
            {user ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <RegisterLink>
                <Button>Get Started</Button>
              </RegisterLink>
            )}
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 md:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground">
            Start free, upgrade when you need more.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for trying out FocusFlow</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Up to 3 projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Unlimited tasks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Basic support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {user ? (
                <Link href="/dashboard" className="w-full">
                  <Button variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <RegisterLink className="w-full">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </RegisterLink>
              )}
            </CardFooter>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-2xl">Plus</CardTitle>
              <CardDescription>For serious builders and teams</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Unlimited projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Unlimited tasks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {user ? (
                <form action={createCheckout.bind(null, STRIPE_PRICE_ID_PLUS)} className="w-full">
                  <Button type="submit" className="w-full">
                    Upgrade to Plus
                  </Button>
                </form>
              ) : (
                <RegisterLink className="w-full">
                  <Button className="w-full">Get Started</Button>
                </RegisterLink>
              )}
            </CardFooter>
          </Card>
        </div>
      </section>

      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 md:px-8 py-8 text-center text-sm text-muted-foreground">
          © 2026 FocusFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
