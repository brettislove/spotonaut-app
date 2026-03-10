import { NextRequest, NextResponse } from "next/server";
import { BillingStatus, PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { findPlanByPriceId, getTierForPlan } from "@/lib/constants/billing";
import {
  MAX_CREDITS_SONDA,
  TIER_SONDA,
  calculateNextResetDate,
  getTierMaxCredits,
} from "@/lib/constants/tiers";
import { getStripe, getStripeWebhookSecrets } from "@/lib/stripe/server";

export const runtime = "nodejs";

const prisma = new PrismaClient();

const STRIPE_STATUS_TO_INTERNAL: Record<string, BillingStatus> = {
  active: BillingStatus.active,
  trialing: BillingStatus.trialing,
  past_due: BillingStatus.past_due,
  canceled: BillingStatus.canceled,
  unpaid: BillingStatus.unpaid,
  incomplete: BillingStatus.incomplete,
  incomplete_expired: BillingStatus.incomplete_expired,
};

interface ThinRelatedObject {
  id?: string;
  type?: string;
  url?: string;
}

type StripeEventWithThinShape = Stripe.Event & {
  related_object?: ThinRelatedObject;
};

function toDateFromUnix(timestamp?: number | null): Date | null {
  if (!timestamp) {
    return null;
  }

  return new Date(timestamp * 1000);
}

function shouldGrantPaidEntitlement(status: string): boolean {
  return status === "active" || status === "trialing";
}

function mapStripeStatus(status: string): BillingStatus {
  return STRIPE_STATUS_TO_INTERNAL[status] ?? BillingStatus.incomplete;
}

function getSnapshotObject(event: Stripe.Event): unknown {
  if (!event.data || !event.data.object) {
    return null;
  }

  return event.data.object;
}

function getRelatedObject(event: Stripe.Event): ThinRelatedObject | null {
  const candidate = (event as StripeEventWithThinShape).related_object;
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  return candidate;
}

function resolveSubscriptionIdFromEvent(event: Stripe.Event): string | null {
  const snapshotObject = getSnapshotObject(event) as
    | Stripe.Subscription
    | { id?: string; object?: string }
    | null;

  if (
    snapshotObject &&
    typeof snapshotObject === "object" &&
    snapshotObject.object === "subscription" &&
    typeof snapshotObject.id === "string"
  ) {
    return snapshotObject.id;
  }

  const relatedObject = getRelatedObject(event);
  const relatedType = relatedObject?.type?.toLowerCase() || "";

  if (
    relatedObject?.id &&
    (relatedType.includes("subscription") ||
      relatedType === "billing.subscription")
  ) {
    return relatedObject.id;
  }

  return null;
}

async function resolveSubscriptionIdFromCheckoutEvent(
  event: Stripe.Event,
  stripe: Stripe,
): Promise<string | null> {
  const snapshotSession = getSnapshotObject(event) as
    | Stripe.Checkout.Session
    | { subscription?: string | Stripe.Subscription | null }
    | null;

  if (snapshotSession?.subscription) {
    return String(snapshotSession.subscription);
  }

  const relatedObject = getRelatedObject(event);
  const relatedType = relatedObject?.type?.toLowerCase() || "";

  if (
    relatedObject?.id &&
    (relatedType.includes("checkout.session") ||
      relatedType === "checkout.session")
  ) {
    const checkoutSession = await stripe.checkout.sessions.retrieve(
      relatedObject.id,
    );

    if (checkoutSession.subscription) {
      return String(checkoutSession.subscription);
    }
  }

  return null;
}

function isCheckoutCompletedEvent(eventType: string): boolean {
  return (
    eventType === "checkout.session.completed" ||
    eventType.endsWith("checkout.session.completed")
  );
}

function isSubscriptionLifecycleEvent(eventType: string): boolean {
  return (
    eventType === "customer.subscription.updated" ||
    eventType === "customer.subscription.created" ||
    eventType === "customer.subscription.deleted" ||
    eventType.includes("subscription.updated") ||
    eventType.includes("subscription.created") ||
    eventType.includes("subscription.deleted")
  );
}

async function upsertSubscriptionFromStripe(
  subscription: Stripe.Subscription,
): Promise<void> {
  const stripeCustomerId = String(subscription.customer);
  const subscriptionItem = subscription.items.data[0];
  const stripePriceId = subscriptionItem?.price?.id;

  if (!stripePriceId) {
    return;
  }

  const mapping = findPlanByPriceId(stripePriceId);
  if (!mapping) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId },
    select: { id: true },
  });

  if (!user) {
    return;
  }

  const tier = getTierForPlan(mapping.plan);
  const status = mapStripeStatus(subscription.status);
  const currentPeriodStart = toDateFromUnix(
    subscriptionItem?.current_period_start,
  );
  const currentPeriodEnd = toDateFromUnix(subscriptionItem?.current_period_end);
  const grantPaid = shouldGrantPaidEntitlement(subscription.status);

  await prisma.$transaction(async (tx) => {
    await tx.billingSubscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      create: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId,
        stripePriceId,
        tier,
        interval: mapping.interval,
        currency: mapping.currency,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
      },
      update: {
        stripePriceId,
        tier,
        interval: mapping.interval,
        currency: mapping.currency,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
      },
    });

    if (grantPaid) {
      const paidMaxCredits = getTierMaxCredits(tier);
      await tx.user.update({
        where: { id: user.id },
        data: {
          tier,
          maxCredits: paidMaxCredits,
          usedCredits: 0,
          creditsResetAt:
            currentPeriodEnd ?? calculateNextResetDate(tier, new Date()),
        },
      });
      return;
    }

    await tx.user.update({
      where: { id: user.id },
      data: {
        tier: TIER_SONDA,
        maxCredits: MAX_CREDITS_SONDA,
        usedCredits: 0,
        creditsResetAt: null,
      },
    });
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecrets = getStripeWebhookSecrets();

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event | null = null;

  for (const secret of webhookSecrets) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
      break;
    } catch {
      continue;
    }
  }

  if (!event) {
    const message =
      "Invalid webhook signature for configured Stripe webhook secrets";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await prisma.billingWebhookEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
        payload: event as unknown as object,
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    console.error("Failed to persist webhook event", error);
    return NextResponse.json(
      { error: "Failed to persist webhook event" },
      { status: 500 },
    );
  }

  try {
    if (isCheckoutCompletedEvent(event.type)) {
      const subscriptionId = await resolveSubscriptionIdFromCheckoutEvent(
        event,
        stripe,
      );

      if (subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        await upsertSubscriptionFromStripe(subscription);
      }
    } else if (isSubscriptionLifecycleEvent(event.type)) {
      const subscriptionId = resolveSubscriptionIdFromEvent(event);

      if (subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        await upsertSubscriptionFromStripe(subscription);
      }
    }

    await prisma.billingWebhookEvent.update({
      where: { stripeEventId: event.id },
      data: {
        processedAt: new Date(),
        processingError: null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", error);

    await prisma.billingWebhookEvent.update({
      where: { stripeEventId: event.id },
      data: {
        processingError:
          error instanceof Error ? error.message : "unknown_processing_error",
      },
    });

    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
