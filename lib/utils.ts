/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a time string (HH:MM format)
 */
export function formatTime(time: string): string {
  return time;
}

/**
 * Validate if a string is not empty
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if start time is before end time
 */
export function isValidTimeRange(startTime: string, endTime: string): boolean {
  return startTime < endTime;
}

/**
 * Check for duplicate entries by a specific field
 */
export function hasDuplicate<T>(
  items: T[],
  field: keyof T,
  value: any,
  excludeId?: string | number
): boolean {
  return items.some((item: any) => {
    const isDifferentItem =
      excludeId !== undefined ? item.id !== excludeId : true;
    return isDifferentItem && item[field] === value;
  });
}

/**
 * Generate a simple unique ID (for client-side use)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safely parse JSON
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Show toast notification (basic implementation)
 */
export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info"
) {
  // For now, using alert. Can be replaced with a proper toast library
  const emoji = type === "success" ? "✓" : type === "error" ? "✗" : "ℹ";
  alert(`${emoji} ${message}`);
}
