import { getProject } from "@/app/actions/projects";
import { TaskList } from "@/components/tasks/TaskList";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getProject(id);

  const completedCount = project.tasks.filter((t) => t.completed).length;
  const progress =
    project.tasks.length > 0
      ? Math.round((completedCount / project.tasks.length) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">
              {project.tasks.length} tasks · {completedCount} completed
            </p>
          </div>
          <CreateTaskDialog projectId={project.id} />
        </div>
      </div>

      {project.tasks.length > 0 && (
        <div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
        </div>
      )}

      <TaskList tasks={project.tasks} />
    </div>
  );
}
