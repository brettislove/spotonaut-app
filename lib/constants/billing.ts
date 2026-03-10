import { TIER_RAKETA, TIER_SATELLITE } from "@/lib/constants/tiers";

export const BILLING_PLAN_RAKETA = "raketa" as const;
export const BILLING_PLAN_SATELLITE = "satellite" as const;

export const BILLING_INTERVAL_MONTH = "month" as const;

export const SUPPORTED_BILLING_CURRENCIES = ["czk", "eur"] as const;

export type BillingPlan =
  | typeof BILLING_PLAN_RAKETA
  | typeof BILLING_PLAN_SATELLITE;
export type BillingInterval = typeof BILLING_INTERVAL_MONTH;
export type BillingCurrency = (typeof SUPPORTED_BILLING_CURRENCIES)[number];

const PLAN_TO_TIER: Record<BillingPlan, number> = {
  [BILLING_PLAN_RAKETA]: TIER_RAKETA,
  [BILLING_PLAN_SATELLITE]: TIER_SATELLITE,
};

function getPriceEnvKey(
  plan: BillingPlan,
  interval: BillingInterval,
  currency: BillingCurrency,
): string {
  return `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}_${currency.toUpperCase()}`;
}

export function normalizeCurrency(input: string): BillingCurrency | null {
  const normalized = input.toLowerCase();
  return SUPPORTED_BILLING_CURRENCIES.includes(normalized as BillingCurrency)
    ? (normalized as BillingCurrency)
    : null;
}

export function resolveStripePriceId(
  plan: BillingPlan,
  interval: BillingInterval,
  currency: BillingCurrency,
): string | null {
  const primaryKey = getPriceEnvKey(plan, interval, currency);
  const value = process.env[primaryKey];

  if (value) {
    return value;
  }

  return null;
}

export function getTierForPlan(plan: BillingPlan): number {
  return PLAN_TO_TIER[plan];
}

export function findPlanByPriceId(priceId: string): {
  plan: BillingPlan;
  interval: BillingInterval;
  currency: BillingCurrency;
} | null {
  const plans: BillingPlan[] = [BILLING_PLAN_RAKETA, BILLING_PLAN_SATELLITE];
  const intervals: BillingInterval[] = [BILLING_INTERVAL_MONTH];

  for (const plan of plans) {
    for (const interval of intervals) {
      for (const currency of SUPPORTED_BILLING_CURRENCIES) {
        const envValue = resolveStripePriceId(plan, interval, currency);
        if (envValue === priceId) {
          return { plan, interval, currency };
        }
      }
    }
  }

  return null;
}
