import type { BillingInterval, BillingPlan } from "@/lib/constants/billing";

interface StartCheckoutInput {
  plan: BillingPlan;
  interval: BillingInterval;
  currency: string;
}

export async function startStripeCheckout({
  plan,
  interval,
  currency,
}: StartCheckoutInput): Promise<void> {
  const response = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan,
      interval,
      currency,
    }),
  });

  if (response.status === 401) {
    window.location.href = "/";
    return;
  }

  const data = (await response.json()) as { error?: string; url?: string };

  if (!response.ok || !data.url) {
    throw new Error(data.error || "Checkout initialization failed");
  }

  window.location.href = data.url;
}
