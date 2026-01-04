import { getProjects } from "@/app/actions/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { getAuthUser } from "@/lib/auth";
import { getUserPlan, getProjectCount, getProjectLimit } from "@/lib/entitlements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { UpgradeProcessingBanner } from "@/components/billing/UpgradeProcessingBanner";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect(process.env.NEXT_PUBLIC_LOGIN_URL ?? "/api/auth/login");
  }

  const projects = await getProjects();
  const plan = await getUserPlan(user.id);
  const projectCount = await getProjectCount(user.id);
  const projectLimit = await getProjectLimit(user.id);

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <UpgradeProcessingBanner />
      </Suspense>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Manage your projects and tasks.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {plan === "FREE" && `${projectCount} of ${projectLimit} used`}
              {plan === "PLUS" && "Unlimited"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((acc, p) => acc + p.taskCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {plan === "FREE" && "Upgrade to Plus for unlimited projects"}
              {plan === "PLUS" && "Thank you for your support!"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>
        {projects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No projects yet</CardTitle>
              <CardDescription>
                Get started by creating your first project.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
