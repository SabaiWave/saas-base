import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  return {
    id: user.id,
    email: user.email ?? null,
  };
}

export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
  };
}
