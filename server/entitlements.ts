// server/entitlements.ts
export function hasProEntitlement(user: any) {
  const raw =
    (user?.plan ??
     user?.planTier ??
     user?.org?.plan ??
     '').toString().trim().toLowerCase();

  // normalize
  const plan = raw.replace(/\s|\+|_/g, ''); // "pro+", "pro_plus" -> "pro"
  return plan === 'pro' || plan === 'premium' || plan === 'enterprise'; // include higher tiers if any
}