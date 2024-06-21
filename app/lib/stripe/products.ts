/*
 * Plans + products, to be cleaned up/adapted to the use case.
 */

export const PLANS = {
  PRO_DAILY: {
    id: 'PRO_DAILY',
    priceId: 'price_pro_daily',
    name: 'Pro plan',
    tier: 'pro',
    mode: 'subscription',
    interval: 'daily',
    price: 5.99,
  },
  PRO_MONTHLY: {
    id: 'PRO_MONTHLY',
    priceId: 'price_pro_monthly',
    name: 'Pro plan',
    tier: 'pro',
    mode: 'subscription',
    interval: 'monthly',
    price: 9.99,
  },
  PRO_YEARLY: {
    id: 'PRO_YEARLY',
    priceId: 'price_pro_yearly',
    name: 'Pro plan',
    tier: 'pro',
    mode: 'subscription',
    interval: 'yearly',
    price: 99.9,
  },
} as const;

export const PLAN_IDS = [PLANS.PRO_DAILY.id, PLANS.PRO_MONTHLY.id, PLANS.PRO_YEARLY.id] as const;

export const CONSUMABLES = {
  API_CREDITS: {
    id: 'API_CREDITS',
    priceId: 'price_api_credits',
    name: 'API credit',
    mode: 'payment',
    price: 0.05,
  },
} as const;

export const CONSUMABLE_IDS = [CONSUMABLES.API_CREDITS.id] as const;

// All products ids
export const PRODUCT_IDS = [...PLAN_IDS, ...CONSUMABLE_IDS] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

// All products
export const PRODUCTS = {
  ...PLANS,
  ...CONSUMABLES,
};

/* Helpers */

export const getPlanByProductId = (productId: string) => {
  const plan = Object.values(PLANS).find((plan) => plan.id === productId);
  if (plan) return plan;
  throw new Error(`Invalid productId: ${productId}`);
};

export const getPlanByPriceId = (priceId: string) => {
  const plan = Object.values(PLANS).find((plan) => plan.priceId === priceId);
  if (plan) return plan;
  throw new Error(`Invalid priceId: ${priceId}`);
};
