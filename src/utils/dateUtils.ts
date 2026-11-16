// Tashkent (UTC+5) consistent date & time helpers across all browsers and server

const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

export function toEpochMs(val: string | number | Date | undefined | null): number {
  if (!val) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (val instanceof Date) return Number.isNaN(val.getTime()) ? 0 : val.getTime();
  const parsed = Date.parse(String(val));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getTashkentDate(val: string | number | Date = Date.now()): Date {
  const ms = typeof val === 'number' && val > 0 ? val : toEpochMs(val) || Date.now();
  return new Date(ms + TASHKENT_OFFSET_MS);
}

/** Returns YYYY-MM-DD in Asia/Tashkent timezone */
export function getTashkentDateKey(val: string | number | Date = Date.now()): string {
  const ms = typeof val === 'number' && val > 0 ? val : toEpochMs(val);
  if (!ms) return '';
  return new Date(ms + TASHKENT_OFFSET_MS).toISOString().slice(0, 10);
}

export function getTodayTashkentKey(): string {
  return new Date(Date.now() + TASHKENT_OFFSET_MS).toISOString().slice(0, 10);
}

export function getYesterdayTashkentKey(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000 + TASHKENT_OFFSET_MS).toISOString().slice(0, 10);
}

export function getTashkentMonthKey(val: string | number | Date = Date.now()): string {
  return getTashkentDateKey(val).slice(0, 7);
}

export function getTashkentHour(val: string | number | Date): number {
  const ms = toEpochMs(val);
  if (!ms) return 12;
  return new Date(ms + TASHKENT_OFFSET_MS).getUTCHours();
}

export function getMsUntilNextTashkentMidnight(): number {
  const nowShifted = Date.now() + TASHKENT_OFFSET_MS;
  const nextMidnightShifted = (Math.floor(nowShifted / 86400000) + 1) * 86400000;
  return Math.max(1000, nextMidnightShifted - nowShifted);
}

export function formatTashkentDateTime(val: string | number | Date | undefined): string {
  const ms = toEpochMs(val);
  if (!ms) return String(val || '—');
  const d = new Date(ms + TASHKENT_OFFSET_MS);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy}, ${hh}:${min}`;
}
