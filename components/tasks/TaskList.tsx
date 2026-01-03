"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTask, deleteTask } from "@/app/actions/tasks";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [optimisticTasks, setOptimisticTasks] = useState(tasks);
  const { toast } = useToast();

  const handleToggle = async (taskId: string) => {
    const taskIndex = optimisticTasks.findIndex((t) => t.id === taskId);
    const newTasks = [...optimisticTasks];
    newTasks[taskIndex] = {
      ...newTasks[taskIndex],
      completed: !newTasks[taskIndex].completed,
    };
    setOptimisticTasks(newTasks);

    const result = await toggleTask({ id: taskId });
    if (!result.success) {
      setOptimisticTasks(optimisticTasks);
      toast({
        title: "Error",
        description: result.error || "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    const result = await deleteTask({ id: taskId });
    if (result.success) {
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  if (optimisticTasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tasks yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {optimisticTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => handleToggle(task.id)}
          />
          <span
            className={`flex-1 ${
              task.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(task.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
