import { format } from 'date-fns';

/**
 * Parse a date string and return a Date object that represents the same date
 * in the local timezone, avoiding UTC conversion issues
 */
export function parseLocalDate(dateString: string): Date {
  // If the date string doesn't include time, add local midnight time
  if (!dateString.includes('T')) {
    return new Date(dateString + 'T00:00:00');
  }
  return new Date(dateString);
}

/**
 * Format a date for display, ensuring it shows the correct local date
 */
export function formatDisplayDate(date: string | Date, formatString: string = 'MMM d, yyyy'): string {
  const localDate = typeof date === 'string' ? parseLocalDate(date) : date;
  return format(localDate, formatString);
}

/**
 * Format a date to yyyy-MM-dd string without timezone conversion
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}