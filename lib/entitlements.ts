import { prisma } from "./prisma";

export const PLAN_LIMITS = {
  FREE: {
    maxProjects: 3,
  },
  PLUS: {
    maxProjects: Infinity,
  },
} as const;

export async function getUserPlan(userId: string): Promise<"FREE" | "PLUS"> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["active", "trialing"],
      },
    },
  });

  return subscription ? "PLUS" : "FREE";
}

export async function canCreateProject(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);

  if (plan === "PLUS") {
    return true;
  }

  const projectCount = await prisma.project.count({
    where: { userId },
  });

  return projectCount < PLAN_LIMITS.FREE.maxProjects;
}

export async function getProjectLimit(userId: string): Promise<number> {
  const plan = await getUserPlan(userId);
  return plan === "PLUS" ? PLAN_LIMITS.PLUS.maxProjects : PLAN_LIMITS.FREE.maxProjects;
}

export async function getProjectCount(userId: string): Promise<number> {
  return await prisma.project.count({
    where: { userId },
  });
}
