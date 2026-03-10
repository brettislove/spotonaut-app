import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return webhookSecret;
}

export function getStripeWebhookSecrets(): string[] {
  const primarySecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secondarySecret = process.env.STRIPE_WEBHOOK_SECRET_THIN;

  const secrets = [primarySecret, secondarySecret].filter(
    (value): value is string => Boolean(value && value.trim()),
  );

  if (secrets.length === 0) {
    throw new Error(
      "At least one Stripe webhook secret must be configured (STRIPE_WEBHOOK_SECRET or STRIPE_WEBHOOK_SECRET_THIN)",
    );
  }

  return secrets;
}

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
