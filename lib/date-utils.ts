/**
 * Parse Clash of Clans API timestamp format to JavaScript Date
 * CoC format: YYYYMMDDTHHmmss.SSSZ
 * Example: 20251220T041627.000Z
 * Standard ISO: 2025-12-20T04:16:27.000Z
 */
export function parseCoCTimestamp(timestamp: string): Date {
  // CoC format: YYYYMMDDTHHmmss.SSSZ
  // Extract parts: YYYY MM DD T HH mm ss .SSS Z

  const year = timestamp.substring(0, 4);
  const month = timestamp.substring(4, 6);
  const day = timestamp.substring(6, 8);
  const hour = timestamp.substring(9, 11);
  const minute = timestamp.substring(11, 13);
  const second = timestamp.substring(13, 15);
  const milliseconds = timestamp.substring(16, 19);

  // Convert to standard ISO format
  const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.${milliseconds}Z`;

  return new Date(isoString);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if a timestamp string is valid
 */
export function isValidCoCTimestamp(timestamp: string): boolean {
  try {
    const date = parseCoCTimestamp(timestamp);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}
