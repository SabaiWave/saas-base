import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log(`[WEBHOOK] Received event: ${event.type} (${event.id})`);

  const existingEvent = await prisma.stripeEvent.findUnique({
    where: { stripeEventId: event.id },
  });

  if (existingEvent) {
    console.log(`[WEBHOOK] Duplicate event ${event.id}, skipping`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  await prisma.stripeEvent.create({
    data: {
      stripeEventId: event.id,
      type: event.type,
    },
  });

  console.log(`[WEBHOOK] Processing new event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "subscription") {
          break;
        }

        const userId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId || !customerId) {
          console.error("Missing userId or customerId in checkout session");
          break;
        }

        const existingCustomer = await prisma.stripeCustomer.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!existingCustomer) {
          await prisma.stripeCustomer.create({
            data: {
              userId,
              stripeCustomerId: customerId,
            },
          });
        }

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: subscription.id },
            create: {
              userId,
              stripeSubscriptionId: subscription.id,
              status: subscription.status,
              priceId: subscription.items.data[0]?.price.id,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
            update: {
              status: subscription.status,
              priceId: subscription.items.data[0]?.price.id,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

        if (!customerId) {
          console.error("Missing customer ID in subscription:", subscription.id);
          break;
        }

        console.log(`[${event.type}] Processing subscription:`, {
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: subscription.current_period_end,
        });

        const stripeCustomer = await prisma.stripeCustomer.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!stripeCustomer) {
          console.error("Customer not found:", customerId);
          break;
        }

        const priceId = subscription.items.data[0]?.price?.id ?? null;
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : new Date();

        const result = await prisma.subscription.upsert({
          where: { stripeSubscriptionId: subscription.id },
          update: {
            status: subscription.status,
            priceId,
            currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          create: {
            userId: stripeCustomer.userId,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            priceId,
            currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        console.log(`[${event.type}] Updated subscription in DB:`, {
          id: result.id,
          status: result.status,
          cancelAtPeriodEnd: result.cancelAtPeriodEnd,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: "canceled" },
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
