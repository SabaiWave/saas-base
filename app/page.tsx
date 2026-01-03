import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FolderKanban, Zap, Shield } from "lucide-react";
import Link from "next/link";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">FocusFlow</div>
          <div className="flex items-center gap-4">
            <LoginLink>
              <Button variant="ghost">Sign In</Button>
            </LoginLink>
            <RegisterLink>
              <Button>Get Started</Button>
            </RegisterLink>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Organize your work, effortlessly
          </h1>
          <p className="text-xl text-muted-foreground">
            FocusFlow is a lightweight workflow tracker designed for solo builders,
            freelancers, and professionals who want to stay organized without the
            complexity of heavy project management tools.
          </p>
          <div className="flex items-center justify-center gap-4">
            <RegisterLink>
              <Button size="lg">Start Free</Button>
            </RegisterLink>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <FolderKanban className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Simple Projects</CardTitle>
              <CardDescription>
                Organize your work into projects and break them down into
                actionable tasks.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Built for speed. No clutter, no distractions. Just you and your
                work.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your data is encrypted and isolated. We take security seriously.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to get focused?
          </h2>
          <p className="text-xl text-muted-foreground">
            Start organizing your projects today. No credit card required.
          </p>
          <RegisterLink>
            <Button size="lg">Get Started Free</Button>
          </RegisterLink>
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
