import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    taskCount: number;
    completedTaskCount: number;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress =
    project.taskCount > 0
      ? Math.round((project.completedTaskCount / project.taskCount) * 100)
      : 0;

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle className="text-lg">{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              <span>{project.taskCount} tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>{project.completedTaskCount} completed</span>
            </div>
          </div>
          {project.taskCount > 0 && (
            <div className="mt-3">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
