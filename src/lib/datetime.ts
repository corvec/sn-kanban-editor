const pad = (n: number): string => String(n).padStart(2, '0');

/** Formats a datetime prefix like "[2026-07-16 14:05]" (local time) */
export const formatDateTime = (date: Date = new Date()): string =>
  `[${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}]`;

const DATETIME_PREFIX = /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?\]/;

export const hasDateTimePrefix = (text: string): boolean =>
  DATETIME_PREFIX.test(text);

/** Prepends a datetime prefix unless the text already carries one */
export const stampDateTime = (text: string, date: Date = new Date()): string =>
  hasDateTimePrefix(text) ? text : `${formatDateTime(date)} ${text}`;
