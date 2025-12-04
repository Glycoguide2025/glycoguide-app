// Stage 7: Seasonal & Continuous Updates Infrastructure
// Quarterly content refreshes to keep GlycoGuide fresh and engaging

interface SeasonalContent {
  season: string;
  startDate: Date;
  endDate: Date;
  theme: {
    name: string;
    colors: {
      primary: string;
      secondary: string;
    };
    affirmations: string[];
  };
}

// Define seasonal content cycles (quarterly updates)
const SEASONAL_CYCLES: SeasonalContent[] = [
  {
    season: 'winter-renewal',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-03-31'),
    theme: {
      name: 'Season of Rest & Renewal',
      colors: {
        primary: '#8B9DC3', // Calming blue
        secondary: '#A9B89E', // Soft sage
      },
      affirmations: [
        "Rest is part of your rhythm.",
        "Winter invites you to slow down.",
        "Stillness brings clarity.",
        "Your body knows how to restore.",
        "Gentle rest, gentle growth.",
      ],
    },
  },
  {
    season: 'spring-awakening',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2025-06-30'),
    theme: {
      name: 'Season of Awakening',
      colors: {
        primary: '#A9B89E', // Fresh sage
        secondary: '#E8F1E3', // Spring green
      },
      affirmations: [
        "New beginnings bloom within you.",
        "Energy returns with gentle patience.",
        "Growth happens in its own time.",
        "Spring reminds you of renewal.",
        "Fresh starts are always available.",
      ],
    },
  },
  {
    season: 'summer-vitality',
    startDate: new Date('2025-07-01'),
    endDate: new Date('2025-09-30'),
    theme: {
      name: 'Season of Vitality',
      colors: {
        primary: '#F0C674', // Warm gold
        secondary: '#A9B89E', // Balanced sage
      },
      affirmations: [
        "Your energy is a gift to nurture.",
        "Summer invites vibrant movement.",
        "Balance activity with rest.",
        "Nourish your body's vitality.",
        "Bright days, mindful choices.",
      ],
    },
  },
  {
    season: 'autumn-balance',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2025-12-31'),
    theme: {
      name: 'Season of Balance',
      colors: {
        primary: '#D4A574', // Autumn bronze
        secondary: '#A9B89E', // Grounding sage
      },
      affirmations: [
        "Find your center in changing seasons.",
        "Balance is a practice, not perfection.",
        "Gratitude grounds your wellness.",
        "Autumn teaches gentle letting go.",
        "Your rhythm flows with the seasons.",
      ],
    },
  },
];

// Get current seasonal content based on date
export function getCurrentSeason(): SeasonalContent {
  const now = new Date();
  
  const currentSeason = SEASONAL_CYCLES.find(
    cycle => now >= cycle.startDate && now <= cycle.endDate
  );
  
  // Default to current quarter if no match
  return currentSeason || SEASONAL_CYCLES[3]; // Default to autumn-balance
}

// Get a random affirmation for the current season
export function getSeasonalAffirmation(): string {
  const season = getCurrentSeason();
  const randomIndex = Math.floor(Math.random() * season.theme.affirmations.length);
  return season.theme.affirmations[randomIndex];
}

// Get seasonal theme colors
export function getSeasonalColors() {
  const season = getCurrentSeason();
  return season.theme.colors;
}

// Check if seasonal content should refresh (weekly check)
export function shouldRefreshSeasonalContent(): boolean {
  const lastRefresh = localStorage.getItem('seasonal_content_refresh');
  
  if (!lastRefresh) {
    localStorage.setItem('seasonal_content_refresh', new Date().toISOString());
    return true;
  }
  
  const lastRefreshDate = new Date(lastRefresh);
  const daysSinceRefresh = Math.floor(
    (new Date().getTime() - lastRefreshDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Refresh weekly (every 7 days)
  if (daysSinceRefresh >= 7) {
    localStorage.setItem('seasonal_content_refresh', new Date().toISOString());
    return true;
  }
  
  return false;
}

// Feature flag system for safe rollout
interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
}

const FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: 'seasonal_themes',
    enabled: true,
    description: 'Enable seasonal color themes and affirmations',
  },
  {
    key: 'seasonal_audio',
    enabled: false, // Can be enabled in future quarters
    description: 'Enable seasonal ambient audio tracks',
  },
  {
    key: 'seasonal_content',
    enabled: true,
    description: 'Enable quarterly content refreshes',
  },
];

export function isFeatureEnabled(featureKey: string): boolean {
  const feature = FEATURE_FLAGS.find(f => f.key === featureKey);
  return feature?.enabled || false;
}

// Get all enabled features
export function getEnabledFeatures(): string[] {
  return FEATURE_FLAGS.filter(f => f.enabled).map(f => f.key);
}
