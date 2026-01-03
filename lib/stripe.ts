import Stripe from "stripe";
import { prisma } from "./prisma";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const existing = await prisma.stripeCustomer.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.stripeCustomer.create({
    data: {
      userId,
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string
): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId, email);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    client_reference_id: userId,
    metadata: {
      userId,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return session.url;
}

export async function createBillingPortalSession(
  userId: string
): Promise<string> {
  const stripeCustomer = await prisma.stripeCustomer.findUnique({
    where: { userId },
  });

  if (!stripeCustomer) {
    throw new Error("No Stripe customer found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomer.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
  });

  return session.url;
}
