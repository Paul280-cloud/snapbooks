// T-BR5-1, T-BR5-2, T-BR5-3
import { buildExportRows, exportFileName, buildWorkbook } from '../../src/lib/rules/export';
import * as XLSX from 'xlsx';
import type { Receipt } from '../../src/lib/api/receipts';

function makeReceipt(overrides: Partial<Receipt>): Receipt {
  return {
    id: 'r0',
    owner_id: 'u1',
    vendor: 'Test',
    amount: 100,
    date: '2026-03-10',
    category: 'Other',
    photo_url: 'u1/r0.jpg',
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
    ...overrides,
  };
}

const RECEIPT_OLD = makeReceipt({ id: 'r1', vendor: 'BP Fuels',   amount: 780,   date: '2026-03-08', category: 'Fuel'  });
const RECEIPT_NEW = makeReceipt({ id: 'r2', vendor: 'Pick n Pay', amount: 320,   date: '2026-03-12', category: 'Stock' });
const RECEIPT_OUT = makeReceipt({ id: 'r3', vendor: 'Shoprite',   amount: 215.5, date: '2026-01-15', category: 'Food'  });

const ALL = [RECEIPT_NEW, RECEIPT_OLD, RECEIPT_OUT]; // intentionally unordered

// ─── T-BR5-1 buildExportRows ──────────────────────────────────────────────────

describe('T-BR5-1 buildExportRows', () => {
  it('filters to receipts within the range, both ends inclusive', () => {
    const rows = buildExportRows(ALL, '2026-03-01', '2026-03-31');
    expect(rows).toHaveLength(2);
    const vendors = rows.map(r => r.Vendor);
    expect(vendors).toContain('BP Fuels');
    expect(vendors).toContain('Pick n Pay');
    expect(vendors).not.toContain('Shoprite');
  });

  it('includes a receipt exactly on the start date', () => {
    const rows = buildExportRows(ALL, '2026-01-15', '2026-01-15');
    expect(rows).toHaveLength(1);
    expect(rows[0].Vendor).toBe('Shoprite');
  });

  it('includes a receipt exactly on the end date', () => {
    const rows = buildExportRows(ALL, '2026-03-01', '2026-03-12');
    expect(rows.map(r => r.Vendor)).toContain('Pick n Pay');
  });

  it('sorts oldest first', () => {
    const rows = buildExportRows(ALL, '2026-03-01', '2026-03-31');
    expect(rows[0].Vendor).toBe('BP Fuels');   // 2026-03-08
    expect(rows[1].Vendor).toBe('Pick n Pay'); // 2026-03-12
  });

  it('uses columns Date, Vendor, Category, Amount (ZAR)', () => {
    const rows = buildExportRows(ALL, '2026-03-01', '2026-03-31');
    expect(rows[0]).toHaveProperty('Date');
    expect(rows[0]).toHaveProperty('Vendor');
    expect(rows[0]).toHaveProperty('Category');
    expect(rows[0]).toHaveProperty('Amount (ZAR)');
  });

  it('Amount (ZAR) value matches the receipt amount', () => {
    const rows = buildExportRows(ALL, '2026-03-01', '2026-03-31');
    expect(rows[0]['Amount (ZAR)']).toBe(780);   // BP Fuels
    expect(rows[1]['Amount (ZAR)']).toBe(320);   // Pick n Pay
  });

  it('returns an empty array when no receipts fall in the range', () => {
    const rows = buildExportRows(ALL, '2027-01-01', '2027-01-31');
    expect(rows).toHaveLength(0);
  });
});

// ─── T-BR5-2 exportFileName ───────────────────────────────────────────────────

describe('T-BR5-2 exportFileName', () => {
  it('returns SnapBooks_export_2026-03-15.xlsx for noon UTC on 15 Mar 2026', () => {
    const name = exportFileName(new Date('2026-03-15T12:00:00Z'));
    expect(name).toBe('SnapBooks_export_2026-03-15.xlsx');
  });

  it('returns SnapBooks_export_2026-03-15.xlsx for 22:30 UTC on 14 Mar (00:30 SAST = 15 Mar)', () => {
    const name = exportFileName(new Date('2026-03-14T22:30:00Z'));
    expect(name).toBe('SnapBooks_export_2026-03-15.xlsx');
  });
});

// ─── T-BR5-3 buildWorkbook ────────────────────────────────────────────────────

describe('T-BR5-3 buildWorkbook', () => {
  const rows = buildExportRows(ALL, '2026-03-01', '2026-03-31');
  const wb = buildWorkbook(rows);
  const ws = wb.Sheets[wb.SheetNames[0]];

  it('has exactly one sheet', () => {
    expect(wb.SheetNames).toHaveLength(1);
  });

  it('has a header row and one row per receipt', () => {
    const data = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
    expect(data[0]).toEqual(['Date', 'Vendor', 'Category', 'Amount (ZAR)']);
    expect(data).toHaveLength(3); // 1 header + 2 data rows
  });

  it('date cells have a date-style format string', () => {
    // A2 is the first data row date (BP Fuels, oldest)
    const cell = ws['A2'];
    expect(cell).toBeDefined();
    expect(cell.t).toBe('n'); // number type (Excel date serial)
    expect(typeof cell.z).toBe('string');
    // Format should contain 'mmm' (abbreviated month) to show "12 Mar 2026"
    expect(cell.z.toLowerCase()).toMatch(/mmm|d|yy/);
  });

  it('amount cells are numbers with 2-decimal format', () => {
    // D2 = BP Fuels (oldest first), D3 = Pick n Pay
    const cell = ws['D2'];
    expect(cell).toBeDefined();
    expect(cell.t).toBe('n');
    expect(cell.v).toBe(780); // BP Fuels
    expect(cell.z).toBe('0.00');
  });
});
