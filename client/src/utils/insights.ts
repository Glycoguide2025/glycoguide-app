import { formatString, formatNumber, capitalize } from './format';
import { InsightData, InsightTypeName, InsightPlaceholders } from '../types/insights';
import { TimeOfDay } from '../types/suggestions';
import strings from '../i18n/en.json';

/**
 * Type-safe insight rendering that pulls from i18n strings
 */
export function renderInsight<T extends InsightTypeName>(
  insight: InsightData,
  placeholders?: InsightPlaceholders<T>
): { title: string; body: string; badge: string } {
  const insightStrings = strings.insights?.types?.[insight.type];
  
  if (!insightStrings) {
    console.warn(`Missing i18n strings for insight type: ${insight.type}`);
    return {
      title: insight.title || 'Insight',
      body: insight.body || 'No description available',
      badge: insight.type?.replace('_', ' ') || 'Insight'
    };
  }

  // Format title (usually no placeholders needed)
  const title = insightStrings.title || insight.title || 'Insight';
  
  // Format body with placeholders if provided
  const body = placeholders 
    ? formatString(insightStrings.body || insight.body || '', placeholders as Record<string, string | number>)
    : (insightStrings.body || insight.body || 'No description available');
    
  // Get badge text
  const badge = insightStrings.badge || insight.type?.replace('_', ' ') || 'Insight';

  return { title, body, badge };
}

/**
 * Extract placeholders from insight data for rendering
 */
export function extractPlaceholders(insight: InsightData): Record<string, string | number> {
  // Parse placeholders from the existing body text if needed
  // This is a fallback for insights that don't have structured placeholder data
  const placeholders: Record<string, string | number> = {};
  
  if (insight.type === 'post_meal_rise') {
    // Extract from body like "Your glucose rose +45 mg/dL after breakfast"
    const deltaMatch = insight.body.match(/\+(\d+)/);
    const mealMatch = insight.body.match(/after (.+?)\./);
    const carbsMatch = insight.body.match(/(\d+)g carbs/);
    
    if (deltaMatch) placeholders.delta = formatNumber(parseInt(deltaMatch[1]));
    if (mealMatch) placeholders.mealName = mealMatch[1];
    if (carbsMatch) placeholders.carbs = formatNumber(parseInt(carbsMatch[1]));
  }
  
  if (insight.type === 'carb_budget_trend') {
    // Extract from body like "You averaged 180g vs a goal of 150g"
    const avgMatch = insight.body.match(/averaged (\d+)g/);
    const goalMatch = insight.body.match(/goal of (\d+)g/);
    
    if (avgMatch) placeholders.avgCarbs = formatNumber(parseInt(avgMatch[1]));
    if (goalMatch) placeholders.dailyGoal = formatNumber(parseInt(goalMatch[1]));
  }
  
  return placeholders;
}

/**
 * Format time of day for display
 */
export function formatTimeOfDay(timeOfDay: TimeOfDay): string {
  return strings.suggestions.timeOfDay[timeOfDay] || capitalize(timeOfDay);
}

/**
 * Get insight action labels
 */
export function getInsightActions() {
  return strings.insights?.actions || {
    viewMeal: "View Meal",
    viewReading: "View Reading"
  };
}

/**
 * Get page strings for insights
 */
export function getInsightPageStrings() {
  return strings.insights?.page || {
    title: "Your Personal Insights",
    subtitle: "Discover patterns and build healthy habits",
    loading: "Loading your insights...",
    error: "Unable to load insights. Please try again.",
    retry: "Retry",
    refresh: "Refresh",
    noInsights: {
      title: "Log at least 1 meal and 1 reading to unlock insights.",
      description: "As you log more, we'll spot simple patterns and suggestions.",
      button: "Check for insights"
    },
    summary: {
      title: "Insights Summary",
      totalInsights: "Total insights",
      mostRecent: "Most recent insight",
      noneYet: "None yet",
      lastUpdated: "Insights updated",
      recently: "Recently",
      startLogging: "Start logging data"
    },
    disclaimer: {
      title: "Wellness Note:",
      text: "These insights support your personal tracking and habit-building. Always consult a healthcare professional for medical guidance."
    }
  };
}

/**
 * Get suggestion strings
 */
export function getSuggestionStrings() {
  return strings.suggestions || {
    title: "Smart picks for now",
    nutrition: "{carbs}g carbs • {fiber}g fiber",
    viewRecipe: "View Recipe",
    badge_fiber: "High fiber",
    badge_budget: "Within budget", 
    badge_dinner_guard: "Dinner-friendly",
    timeOfDay: {
      morning: "Morning",
      lunch: "Lunch", 
      evening: "Evening"
    }
  };
}

/**
 * Get home page strings
 */
export function getHomeStrings() {
  return strings.home || {
    insights: {
      title: "Today's Insight"
    },
    timeline: {
      title: "Today's Timeline",
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      logged: "Logged",
      addMeal: "Add Meal"
    }
  };
}

/**
 * Get wellness encouragement strings
 */
export function getWellnessStrings() {
  return strings.wellness || {
    encouragement: {
      hasInsights: "🎉 Great job tracking your wellness journey! Your insights update automatically as you log more data.",
      noInsights: "🌱 Start logging meals and glucose readings to generate personalized insights about your wellness patterns."
    }
  };
}