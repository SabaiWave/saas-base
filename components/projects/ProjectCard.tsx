"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteProject } from "@/app/actions/projects";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    taskCount: number;
    completedTaskCount: number;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const progress =
    project.taskCount > 0
      ? Math.round((project.completedTaskCount / project.taskCount) * 100)
      : 0;

  const hasUnfinishedTasks = project.taskCount > project.completedTaskCount;

  const handleDeleteClick = () => {
    if (hasUnfinishedTasks) {
      toast({
        title: "Cannot delete project",
        description: "Complete or delete all tasks before deleting this project.",
        variant: "destructive",
      });
      return;
    }
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProject({ id: project.id });

      if (result.success) {
        toast({
          title: "Project deleted",
          description: "The project has been successfully deleted.",
        });
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast({
          title: "Cannot delete project",
          description: result.error,
          variant: "destructive",
        });
        setShowDeleteDialog(false);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
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
              <div className="mt-3 flex-1 flex flex-col justify-end">
                {project.taskCount > 0 ? (
                  <div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
                  </div>
                ) : (
                  <div className="h-2" />
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.preventDefault();
            handleDeleteClick();
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Project
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{project.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
