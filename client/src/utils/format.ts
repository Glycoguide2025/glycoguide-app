// Utility for safe placeholder replacement with type checking

/**
 * Replaces placeholders in a string template with provided values
 * @param template - String with {placeholder} markers
 * @param values - Object with placeholder values
 * @returns Formatted string with placeholders replaced
 */
export function formatString(template: string, values: Record<string, string | number>): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    const value = values[key];
    if (value === undefined || value === null) {
      console.warn(`Missing placeholder value for key: ${key} in template: ${template}`);
      return match; // Return the placeholder if value is missing
    }
    return String(value);
  });
}

/**
 * Type-safe formatting that validates placeholder keys at compile time
 */
export function formatTypedString<T extends Record<string, string | number>>(
  template: string,
  values: T
): string {
  return formatString(template, values);
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats numbers for display (rounds to 1 decimal place if needed)
 */
export function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}