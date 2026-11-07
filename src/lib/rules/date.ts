const SAST_OFFSET_MS = 2 * 60 * 60 * 1000; // UTC+2

export function isFutureInSAST(dateString: string, now: Date): boolean {
  if (!dateString) return false;

  const nowSAST = new Date(now.getTime() + SAST_OFFSET_MS);
  const y = nowSAST.getUTCFullYear();
  const m = String(nowSAST.getUTCMonth() + 1).padStart(2, '0');
  const d = String(nowSAST.getUTCDate()).padStart(2, '0');
  const todaySAST = `${y}-${m}-${d}`;

  return dateString > todaySAST;
}
