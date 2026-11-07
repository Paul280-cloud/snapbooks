import { parseReceiptText } from '../../src/lib/rules/receiptReader';

// T-BR8-1 to T-BR8-4: parseReceiptText parses raw OCR text into structured fields.
// The function is pure so it can be tested without Tesseract.js.

describe('T-BR8-1 vendor parsing', () => {
  it('extracts the first non-empty line as the vendor', () => {
    const result = parseReceiptText('Pick n Pay\nR 149.00\n2026-03-12\nFood');
    expect(result.vendor).toBe('Pick n Pay');
  });

  it('trims whitespace from the vendor', () => {
    const result = parseReceiptText('  Shoprite  \nR 299.00');
    expect(result.vendor).toBe('Shoprite');
  });

  it('returns empty string when text is empty', () => {
    const result = parseReceiptText('');
    expect(result.vendor).toBe('');
  });
});

describe('T-BR8-2 amount parsing', () => {
  it('extracts a plain decimal amount like 149.00', () => {
    const result = parseReceiptText('Some Store\nTotal: 149.00\n2026-03-12');
    expect(result.amount).toBe('149.00');
  });

  it('extracts an amount prefixed with R', () => {
    const result = parseReceiptText('Store\nR 1 200.50\n2026-01-01');
    expect(result.amount).toBe('1200.50');
  });

  it('extracts amount with comma decimal separator', () => {
    const result = parseReceiptText('Store\nTOTAL 89,99\n2026-01-01');
    expect(result.amount).toBe('89.99');
  });

  it('returns empty string when no amount is found', () => {
    const result = parseReceiptText('Store\nno numbers here');
    expect(result.amount).toBe('');
  });

  it('picks the largest number as the amount (grand total heuristic)', () => {
    const result = parseReceiptText('Store\nSubtotal: 50.00\nVAT: 7.50\nTotal: 57.50');
    expect(result.amount).toBe('57.50');
  });
});

describe('T-BR8-3 date parsing', () => {
  it('extracts a YYYY-MM-DD date', () => {
    const result = parseReceiptText('Store\n149.00\n2026-03-12');
    expect(result.date).toBe('2026-03-12');
  });

  it('extracts a DD/MM/YYYY date and converts to YYYY-MM-DD', () => {
    const result = parseReceiptText('Store\n149.00\n12/03/2026');
    expect(result.date).toBe('2026-03-12');
  });

  it('extracts a DD-MM-YYYY date and converts to YYYY-MM-DD', () => {
    const result = parseReceiptText('Store\n149.00\n12-03-2026');
    expect(result.date).toBe('2026-03-12');
  });

  it('returns empty string when no date is found', () => {
    const result = parseReceiptText('Store\nno date here');
    expect(result.date).toBe('');
  });
});

describe('T-BR8-4 category parsing', () => {
  it('detects Food from keywords like "food", "grocery", "supermarket"', () => {
    const result = parseReceiptText('Pick n Pay Supermarket\nR 149.00\n2026-03-12');
    expect(result.category).toBe('Food');
  });

  it('detects Fuel from keywords like "fuel", "petrol", "gas"', () => {
    const result = parseReceiptText('Engen Petrol Station\nR 800.00\n2026-03-12');
    expect(result.category).toBe('Fuel');
  });

  it('detects Stock from keywords like "stock", "wholesale", "supplies"', () => {
    const result = parseReceiptText('Makro Wholesale\nR 1200.00\n2026-03-12');
    expect(result.category).toBe('Stock');
  });

  it('defaults to Other when no category keyword is matched', () => {
    const result = parseReceiptText('Some Random Shop\nR 50.00\n2026-03-12');
    expect(result.category).toBe('Other');
  });
});
