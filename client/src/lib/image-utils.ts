/**
 * Utility function to build image URLs with deterministic cache-busting
 * Uses meal.imageVersion for consistent cache behavior across all app components
 */
export function buildImageSrc(imageUrl: string, imageVersion?: string | number): string {
  if (!imageUrl) return '';
  
  try {
    // Use URL API to safely handle existing query parameters
    const url = new URL(imageUrl, window.location.origin);
    
    // Add version parameter for deterministic cache-busting
    // Use imageVersion from meal data, fallback to hash of URL for consistency
    const versionParam = imageVersion?.toString() || hashString(imageUrl).toString();
    url.searchParams.set('v', versionParam);
    
    return url.pathname + url.search;
  } catch (error) {
    // Fallback for relative URLs or malformed URLs
    const separator = imageUrl.includes('?') ? '&' : '?';
    const versionParam = imageVersion?.toString() || hashString(imageUrl).toString();
    return `${imageUrl}${separator}v=${versionParam}`;
  }
}

/**
 * Simple string hash function for deterministic fallback versioning
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}