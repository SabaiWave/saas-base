import { z } from "zod";

// Project validation schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
});

export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
});

export const deleteProjectSchema = z.object({
  id: z.string().uuid(),
});

// Task validation schemas
export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1, "Task title is required").max(200, "Task title must be less than 200 characters"),
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Task title is required").max(200, "Task title must be less than 200 characters"),
});

export const toggleTaskSchema = z.object({
  id: z.string().uuid(),
});

export const deleteTaskSchema = z.object({
  id: z.string().uuid(),
});

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ToggleTaskInput = z.infer<typeof toggleTaskSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
