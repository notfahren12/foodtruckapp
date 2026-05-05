export const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function startOfDay(value: Date | string) {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDaysUntilExpiration(date?: string | null, from = new Date()) {
  if (!date) {
    return null;
  }

  const distance = startOfDay(date).getTime() - startOfDay(from).getTime();
  return Math.ceil(distance / DAY_IN_MS);
}

export function formatDate(date?: string | null) {
  if (!date) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date?: string | null) {
  if (!date) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function isWithinDays(date: string | undefined, days: number, from = new Date()) {
  const diff = getDaysUntilExpiration(date, from);
  return diff !== null && diff >= 0 && diff <= days;
}

export function isPast(date: string | undefined, from = new Date()) {
  const diff = getDaysUntilExpiration(date, from);
  return diff !== null && diff < 0;
}

export function getMonthGrid(anchor = new Date()) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const cells: Array<{ key: string; date?: Date; dayNumber?: number }> = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push({ key: `empty-${index}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ key: `${year}-${month + 1}-${day}`, date: new Date(year, month, day), dayNumber: day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `tail-${cells.length}` });
  }

  return cells;
}
