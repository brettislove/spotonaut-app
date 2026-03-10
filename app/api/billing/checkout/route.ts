import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import {
  BILLING_INTERVAL_MONTH,
  BILLING_PLAN_RAKETA,
  BILLING_PLAN_SATELLITE,
  type BillingInterval,
  type BillingPlan,
  normalizeCurrency,
  resolveStripePriceId,
} from "@/lib/constants/billing";
import { getAppBaseUrl, getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";

const prisma = new PrismaClient();

interface CheckoutBody {
  plan?: string;
  interval?: string;
  currency?: string;
}

function isValidPlan(plan: string): plan is BillingPlan {
  return [BILLING_PLAN_RAKETA, BILLING_PLAN_SATELLITE].includes(
    plan as BillingPlan,
  );
}

function isValidInterval(interval: string): interval is BillingInterval {
  return interval === BILLING_INTERVAL_MONTH;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CheckoutBody;
    const plan = body.plan?.toLowerCase();
    const interval = body.interval?.toLowerCase();
    const currency = normalizeCurrency(body.currency || "");

    if (!plan || !isValidPlan(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!interval || !isValidInterval(interval)) {
      return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
    }

    if (!currency) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    const stripePriceId = resolveStripePriceId(plan, interval, currency);
    if (!stripePriceId) {
      return NextResponse.json(
        { error: "Stripe price is not configured for this combination" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stripe = getStripe();

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId,
        },
      });
    }

    const appBaseUrl = getAppBaseUrl();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${appBaseUrl}/app/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/app/billing/cancel`,
      metadata: {
        userId: user.id,
        plan,
        interval,
        currency,
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
