"use server";

import { requireAuth } from "@/lib/auth";
import { createCheckoutSession, createBillingPortalSession } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createCheckout(priceId: string): Promise<void> {
  const user = await requireAuth();

  if (!user.email) {
    throw new Error("User email is required for checkout");
  }

  const url = await createCheckoutSession(user.id, user.email, priceId);
  redirect(url);
}

export async function createPortalSession(): Promise<void> {
  const user = await requireAuth();

  const url = await createBillingPortalSession(user.id);
  redirect(url);
}
