// Stage 15: Feature flag system for production deployment
export type UserTier = 'free' | 'premium' | 'pro';

// Feature flag definitions with subscription tier requirements
const FEATURE_FLAGS = {
  // Beta features
  'beta_community_moderation': { plans: ['pro'], enabled: true },
  'beta_cgm_import': { plans: ['premium', 'pro'], enabled: true },
  'beta_ai_coaching': { plans: ['pro'], enabled: false },
  'beta_telehealth': { plans: ['premium', 'pro'], enabled: false },
  
  // Core features
  'unlimited_meal_logging': { plans: ['premium', 'pro'], enabled: true },
  'advanced_insights': { plans: ['premium', 'pro'], enabled: true },
  'export_data': { plans: ['premium', 'pro'], enabled: true },
  'priority_support': { plans: ['pro'], enabled: true },
  
  // Stage 17: Wearables features (Premium-only)
  'wearablesImport': { plans: ['premium'], enabled: true },
  
  // Experimental features
  'experimental_sleep_tracking': { plans: ['free', 'premium', 'pro'], enabled: true },
  'experimental_movement_library': { plans: ['free', 'premium', 'pro'], enabled: true },
  'experimental_social_features': { plans: ['premium'], enabled: true }, // Community Hub is Premium-only
  
  // Administrative features
  'admin_panel': { plans: ['pro'], enabled: true },
  'admin_smoke_tests': { plans: ['pro'], enabled: true },
  'admin_user_management': { plans: ['pro'], enabled: false },
  
  // Maintenance flags
  'maintenance_mode': { plans: ['free', 'premium', 'pro'], enabled: false },
  'read_only_mode': { plans: ['free', 'premium', 'pro'], enabled: false }
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled for a given subscription plan
 * @param flag - The feature flag to check
 * @param userTier - The user's subscription tier
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag, userTier: UserTier): boolean {
  const feature = FEATURE_FLAGS[flag];
  
  if (!feature) {
    console.warn(`[feature-flag] Unknown feature flag: ${flag}`);
    return false;
  }
  
  // Check if feature is globally enabled
  if (!feature.enabled) {
    return false;
  }
  
  // Check if user's tier has access to this feature
  return (feature.plans as readonly UserTier[]).includes(userTier);
}

/**
 * Get all enabled features for a user's subscription tier
 * @param userTier - The user's subscription tier
 * @returns Array of enabled feature flags
 */
export function getEnabledFeatures(userTier: UserTier): FeatureFlag[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlag[]).filter(flag => 
    isFeatureEnabled(flag, userTier)
  );
}

/**
 * Get feature flag configuration for debugging/admin purposes
 * @returns Complete feature flag configuration
 */
export function getFeatureFlagConfig() {
  return FEATURE_FLAGS;
}

/**
 * Middleware to check feature flag access
 * @param flag - The feature flag to check
 * @returns Express middleware function
 */
export function requireFeature(flag: FeatureFlag) {
  return (req: any, res: any, next: any) => {
    const user = req.cachedUser || req.user;
    const userTier = (user?.subscriptionTier || 'free') as UserTier;
    
    if (!isFeatureEnabled(flag, userTier)) {
      return res.status(403).json({
        message: `This feature requires a higher subscription tier.`,
        featureFlag: flag,
        currentTier: userTier,
        requiredTiers: FEATURE_FLAGS[flag]?.plans || [],
        subscriptionRequired: true
      });
    }
    
    next();
  };
}