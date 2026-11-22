// Meta Ads promotion packages for CarUnity
// Each package combines Meta (Facebook/Instagram) ad spend + CarUnity platform promotion

export const META_ADS_PACKAGES = [
  { id: 'meta_boost', name: 'Meta Boost', price: 49.99, metaBudget: 45, boostDays: 7, boostPrice: 9.99, topSpotDays: 0, topSpotPrice: 0, carunityMargin: 4.99, adDurationDays: 7, platformPromotionType: 'boost', platformPromotionDays: 7, highlight: false },
  { id: 'meta_premium', name: 'Meta Premium', price: 89.99, metaBudget: 80, boostDays: 7, boostPrice: 9.99, topSpotDays: 0, topSpotPrice: 0, carunityMargin: 9.99, adDurationDays: 7, platformPromotionType: 'boost', platformPromotionDays: 7, highlight: true },
  { id: 'meta_top', name: 'Meta TOP', price: 139.99, metaBudget: 130, boostDays: 0, boostPrice: 0, topSpotDays: 7, topSpotPrice: 59.99, carunityMargin: 9.99, adDurationDays: 7, platformPromotionType: 'top_spot', platformPromotionDays: 7, highlight: false },
];

export function getMetaPackageById(id) {
  return META_ADS_PACKAGES.find(p => p.id === id);
}