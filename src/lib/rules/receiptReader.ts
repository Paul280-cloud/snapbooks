export interface OCRResult {
  vendor: string;
  amount: string;
  date: string;
  category: string;
}

const ISO_DATE_RE = /\b(\d{4})-(\d{2})-(\d{2})\b/;
const DMY_DATE_RE = /\b(\d{2})[-/](\d{2})[-/](\d{4})\b/;
const AMOUNT_RE = /R?\s*([\d\s,]+[.,]\d{2})/gi;

export function parseReceiptText(text: string): OCRResult {
  if (!text) return { vendor: '', amount: '', date: '', category: 'Other' };

  const lines = text.split('\n');

  const vendor = (lines.find((l) => l.trim()) ?? '').trim();

  let date = '';
  for (const line of lines) {
    const iso = line.match(ISO_DATE_RE);
    if (iso) { date = iso[0]; break; }
    const dmy = line.match(DMY_DATE_RE);
    if (dmy) { date = `${dmy[3]}-${dmy[2]}-${dmy[1]}`; break; }
  }

  const amounts: number[] = [];
  for (const line of lines) {
    for (const m of line.matchAll(AMOUNT_RE)) {
      let raw = m[1].replace(/\s/g, '');
      if (raw.includes(',') && raw.includes('.')) {
        raw = raw.replace(/,/g, '');
      } else if (raw.includes(',')) {
        raw = raw.replace(',', '.');
      }
      const val = parseFloat(raw);
      if (!isNaN(val) && val > 0) amounts.push(val);
    }
  }
  const amount =
    amounts.length > 0 ? amounts.reduce((a, b) => (b > a ? b : a)).toFixed(2) : '';

  const lower = text.toLowerCase();
  let category = 'Other';
  if (/food|grocery|groceries|supermarket|spar|checkers|woolworths/.test(lower)) {
    category = 'Food';
  } else if (/fuel|petrol|diesel|gas|engen|shell|bp|caltex/.test(lower)) {
    category = 'Fuel';
  } else if (/stock|wholesale|supplies|makro|builders|warehouse/.test(lower)) {
    category = 'Stock';
  } else if (/rent|lease|property/.test(lower)) {
    category = 'Rent';
  }

  return { vendor, amount, date, category };
}
