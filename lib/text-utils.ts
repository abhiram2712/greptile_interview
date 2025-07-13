/**
 * Remove leading markdown header symbols from summary text
 */
export function cleanSummary(summary: string): string {
  // Remove only leading # symbols, preserving the text
  return summary.replace(/^#+\s?/, '').trim();
}