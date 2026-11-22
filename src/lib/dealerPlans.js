/**
 * Dealer subscription plan configuration.
 * Controls feature access and listing limits per plan tier.
 */

export const PLAN_TIERS = {
  starter: {
    id: 'starter',
    maxListings: 5,
    hasLeads: false,
    hasFastSale: false,
    hasGetOffers: false,
    hasPremiumAnalytics: false,
    hasGoodAnalytics: false,
    hasImport: true,
  },
  pro: {
    id: 'pro',
    maxListings: 30,
    hasLeads: false,
    hasFastSale: false,
    hasGetOffers: true,
    hasPremiumAnalytics: false,
    hasGoodAnalytics: true,
    hasImport: true,
  },
  premium: {
    id: 'premium',
    maxListings: Infinity,
    hasLeads: true,
    hasFastSale: true,
    hasGetOffers: true,
    hasPremiumAnalytics: true,
    hasGoodAnalytics: true,
    hasImport: true,
  },
};

/**
 * Get the plan config for a dealer's subscription_type.
 * Falls back to starter for unknown/null values.
 */
export function getPlan(subscriptionType) {
  return PLAN_TIERS[subscriptionType] || PLAN_TIERS.starter;
}

/**
 * Check if the dealer can add more listings.
 */
export function canAddListing(subscriptionType, currentCount) {
  const plan = getPlan(subscriptionType);
  return currentCount < plan.maxListings;
}

/**
 * Get the remaining listing slots for a dealer.
 */
export function getRemainingSlots(subscriptionType, currentCount) {
  const plan = getPlan(subscriptionType);
  if (plan.maxListings === Infinity) return Infinity;
  return Math.max(0, plan.maxListings - currentCount);
}

/**
 * Get the list of sidebar nav items that should be visible for a plan.
 */
export function getVisibleNavItems(subscriptionType) {
  const plan = getPlan(subscriptionType);
  return {
    leads: plan.hasLeads,
    'fast-sale': plan.hasFastSale,
    'get-offers': plan.hasGetOffers,
    import: plan.hasImport,
  };
}