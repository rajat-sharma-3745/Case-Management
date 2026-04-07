export function utcStartOfCalendarDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  );
}

export function addUtcCalendarDays(start: Date, days: number): Date {
  return new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate() + days,
      0,
      0,
      0,
      0
    )
  );
}
