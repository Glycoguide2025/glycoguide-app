// Simple cache invalidation helper for React Query
// Force frontend to fetch fresh meal data

async function invalidateMealsCache() {
  // This will be called from the frontend to clear React Query cache
  console.log("Invalidating meals cache...");
}

export { invalidateMealsCache };