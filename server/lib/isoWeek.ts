/**
 * ISO Week utilities for weekly activity tracking
 * Supports proper week boundaries and plan-based history limits
 */

export interface IsoWeek {
  isoYear: number;
  isoWeek: number;
}

/**
 * Get the ISO year and week number for a given date
 * ISO weeks run Monday to Sunday and week 1 contains January 4th
 */
export function isoYearWeek(d = new Date()): IsoWeek {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7; // Convert Sunday (0) to 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { isoYear: date.getUTCFullYear(), isoWeek: weekNo };
}

/**
 * Determine how many weeks back a user can access based on their plan
 * Free=1 week (~7d), Pro=2 weeks (~14d), Premium=4 weeks (~30d)
 */
export function weeksBackForPlan(plan: "free" | "pro" | "premium"): number {
  switch (plan) {
    case "premium": return 4;
    case "pro": return 2;
    case "free":
    default: return 1;
  }
}

/**
 * Step back one ISO week, handling year boundary correctly
 */
export function stepBackWeek(isoYear: number, isoWeek: number): IsoWeek {
  if (isoWeek > 1) {
    return { isoYear, isoWeek: isoWeek - 1 };
  }
  
  // Move to last ISO week of previous year
  // December 28th is always in the last ISO week of the year
  const dec28 = new Date(Date.UTC(isoYear - 1, 11, 28));
  const { isoWeek: lastWeek } = isoYearWeek(dec28);
  return { isoYear: isoYear - 1, isoWeek: lastWeek };
}

/**
 * Generate a list of (year, week) pairs going back N weeks from current
 * Useful for building database queries for plan-limited history
 */
export function getWeekHistory(count: number, startWeek?: IsoWeek): IsoWeek[] {
  const current = startWeek || isoYearWeek();
  const weeks: IsoWeek[] = [];
  
  let { isoYear, isoWeek } = current;
  for (let i = 0; i < count; i++) {
    weeks.push({ isoYear, isoWeek });
    const prev = stepBackWeek(isoYear, isoWeek);
    isoYear = prev.isoYear;
    isoWeek = prev.isoWeek;
  }
  
  return weeks;
}

/**
 * Create a storage key for localStorage that auto-resets weekly
 * Useful for client-side fallback when server is unavailable
 */
export function localStorageKeyForWeek(weekOffset = 0): string {
  const current = isoYearWeek();
  let targetWeek = current;
  
  // Step back by weekOffset weeks if specified
  for (let i = 0; i < weekOffset; i++) {
    targetWeek = stepBackWeek(targetWeek.isoYear, targetWeek.isoWeek);
  }
  
  return `weeklyChecklist:${targetWeek.isoYear}-W${targetWeek.isoWeek}`;
}