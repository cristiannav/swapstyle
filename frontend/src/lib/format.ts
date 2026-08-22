const RTF = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 31_536_000_000 },
  { unit: 'month', ms: 2_592_000_000 },
  { unit: 'week', ms: 604_800_000 },
  { unit: 'day', ms: 86_400_000 },
  { unit: 'hour', ms: 3_600_000 },
  { unit: 'minute', ms: 60_000 },
  { unit: 'second', ms: 1000 },
];

export function formatDistanceToNow(date: Date | string): string {
  const target = new Date(date).getTime();
  const diff = target - Date.now();
  const abs = Math.abs(diff);
  for (const { unit, ms } of UNITS) {
    if (abs >= ms || unit === 'second') {
      return RTF.format(Math.round(diff / ms), unit);
    }
  }
  return RTF.format(0, 'second');
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
