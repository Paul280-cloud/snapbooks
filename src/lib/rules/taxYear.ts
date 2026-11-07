const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;

function leapYear(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function febEnd(year: number): string {
  return leapYear(year) ? `${year}-02-29` : `${year}-02-28`;
}

export function taxYearFor(now: Date): { start: string; end: string } {
  const sast = new Date(now.getTime() + SAST_OFFSET_MS);
  const year = sast.getUTCFullYear();
  const month = sast.getUTCMonth() + 1; // 1-based

  if (month >= 3) {
    return { start: `${year}-03-01`, end: febEnd(year + 1) };
  } else {
    return { start: `${year - 1}-03-01`, end: febEnd(year) };
  }
}
