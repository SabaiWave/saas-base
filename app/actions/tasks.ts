"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createTaskSchema,
  updateTaskSchema,
  toggleTaskSchema,
  deleteTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type ToggleTaskInput,
  type DeleteTaskInput,
} from "@/lib/zod";

export async function createTask(
  input: CreateTaskInput
): Promise<{ success: boolean; error?: string; taskId?: string }> {
  try {
    const user = await requireAuth();
    const validated = createTaskSchema.parse(input);

    const project = await prisma.project.findFirst({
      where: {
        id: validated.projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        projectId: validated.projectId,
        title: validated.title,
      },
    });

    revalidatePath(`/dashboard/projects/${validated.projectId}`);
    revalidatePath("/dashboard");

    return { success: true, taskId: task.id };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

export async function updateTask(
  input: UpdateTaskInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    const validated = updateTaskSchema.parse(input);

    const task = await prisma.task.findFirst({
      where: {
        id: validated.id,
        userId: user.id,
      },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    await prisma.task.update({
      where: { id: validated.id },
      data: { title: validated.title },
    });

    revalidatePath(`/dashboard/projects/${task.projectId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to update task:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function toggleTask(
  input: ToggleTaskInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    const validated = toggleTaskSchema.parse(input);

    const task = await prisma.task.findFirst({
      where: {
        id: validated.id,
        userId: user.id,
      },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    await prisma.task.update({
      where: { id: validated.id },
      data: { completed: !task.completed },
    });

    revalidatePath(`/dashboard/projects/${task.projectId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle task:", error);
    return { success: false, error: "Failed to toggle task" };
  }
}

export async function deleteTask(
  input: DeleteTaskInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    const validated = deleteTaskSchema.parse(input);

    const task = await prisma.task.findFirst({
      where: {
        id: validated.id,
        userId: user.id,
      },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    await prisma.task.delete({
      where: { id: validated.id },
    });

    revalidatePath(`/dashboard/projects/${task.projectId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}
