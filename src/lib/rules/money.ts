export function parseAmount(raw: string): number | null {
  if (!raw || !raw.trim()) return null;
  let str = raw.replace(/^R\s*/i, '').trim();
  if (str.includes(',') && str.includes('.')) {
    str = str.replace(/,/g, '');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  str = str.replace(/\s/g, '');
  const val = parseFloat(str);
  if (isNaN(val) || val <= 0) return null;
  return val;
}

export function sumRand(amounts: number[]): number {
  const cents = amounts.reduce((sum, a) => sum + Math.round(a * 100), 0);
  return cents / 100;
}

export function formatRand(amount: number): string {
  const [intPart, decPart] = amount.toFixed(2).split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `R ${withThousands}.${decPart}`;
}
