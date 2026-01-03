"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canCreateProject } from "@/lib/entitlements";
import {
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type DeleteProjectInput,
} from "@/lib/zod";

export async function getProjects() {
  const user = await requireAuth();

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        select: {
          id: true,
          completed: true,
        },
      },
    },
  });

  return projects.map((project) => ({
    ...project,
    taskCount: project.tasks.length,
    completedTaskCount: project.tasks.filter((t) => t.completed).length,
  }));
}

export async function createProject(
  input: CreateProjectInput
): Promise<{ success: boolean; error?: string; projectId?: string }> {
  try {
    const user = await requireAuth();
    const validated = createProjectSchema.parse(input);

    const canCreate = await canCreateProject(user.id);
    if (!canCreate) {
      return {
        success: false,
        error: "You've reached the project limit for your plan. Upgrade to Plus for unlimited projects.",
      };
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: validated.name,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");

    return { success: true, projectId: project.id };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function updateProject(
  input: UpdateProjectInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    const validated = updateProjectSchema.parse(input);

    const project = await prisma.project.findFirst({
      where: {
        id: validated.id,
        userId: user.id,
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    await prisma.project.update({
      where: { id: validated.id },
      data: { name: validated.name },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${validated.id}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProject(
  input: DeleteProjectInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    const validated = deleteProjectSchema.parse(input);

    const project = await prisma.project.findFirst({
      where: {
        id: validated.id,
        userId: user.id,
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    await prisma.project.delete({
      where: { id: validated.id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

export async function getProject(projectId: string) {
  const user = await requireAuth();

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}
