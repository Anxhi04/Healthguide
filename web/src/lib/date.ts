const calendarDate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  if (year < 1) return null;
  const date = new Date(0); date.setUTCFullYear(year, month - 1, day); date.setUTCHours(0, 0, 0, 0);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
};

export function toDate(value: unknown): Date | null {
  let date: Date;
  if (value instanceof Date) date = value;
  else if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value) && !calendarDate(value.slice(0, 10))) return null;
    date = new Date(value);
  } else if (value && typeof value === "object") {
    const timestamp = value as { _seconds?: unknown; seconds?: unknown };
    const seconds = timestamp._seconds ?? timestamp.seconds;
    if (typeof seconds !== "number" || !Number.isFinite(seconds)) return null;
    date = new Date(seconds * 1000);
  } else return null;
  return Number.isNaN(date.getTime()) ? null : date;
}

export const toDateInputValue = (value: unknown): string => {
  const date = toDate(value);
  if (!date) return "";
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : date.toISOString().slice(0, 10);
};
export const isValidBirthDate = (value: string): boolean => {
  const date = calendarDate(value);
  return !!date && value <= new Date().toISOString().slice(0, 10);
};
export const formatDateOnly = (value: unknown): string => {
  const date = calendarDate(toDateInputValue(value));
  return date ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "Date unavailable";
};
export const formatDateTime = (value: unknown): string => toDate(value)?.toLocaleString() ?? "Date unavailable";
