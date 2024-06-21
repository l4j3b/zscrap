import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, withTime = false) {
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };

  if (withTime) {
    options.hour = 'numeric';
    options.minute = 'numeric';
  }

  return new Date(date).toLocaleString('en-US', options);
}

// TODO: use csv-stringify when possible on CF
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateCSV(data: Record<string, any>[]): string {
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')),
  ];

  return csvRows.join('\n');
}
