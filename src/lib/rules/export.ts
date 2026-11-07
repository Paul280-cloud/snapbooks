import * as XLSX from 'xlsx';
import type { Receipt } from '../api/receipts';

export interface ExportRow {
  Date: string;
  Vendor: string;
  Category: string;
  'Amount (ZAR)': number;
}

const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;

// Excel date serial: days since 1899-12-31 (accounting for the 1900 leap year bug)
function toExcelSerial(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 31)) / 86400000) + 1;
}

export function buildExportRows(
  receipts: Receipt[],
  start: string,
  end: string,
): ExportRow[] {
  return receipts
    .filter(r => r.date >= start && r.date <= end)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map(r => ({
      Date: r.date,
      Vendor: r.vendor,
      Category: r.category,
      'Amount (ZAR)': r.amount,
    }));
}

export function exportFileName(now: Date): string {
  const sast = new Date(now.getTime() + SAST_OFFSET_MS);
  const y = sast.getUTCFullYear();
  const m = String(sast.getUTCMonth() + 1).padStart(2, '0');
  const d = String(sast.getUTCDate()).padStart(2, '0');
  return `SnapBooks_export_${y}-${m}-${d}.xlsx`;
}

export function buildWorkbook(rows: ExportRow[]): XLSX.WorkBook {
  const header = ['Date', 'Vendor', 'Category', 'Amount (ZAR)'];
  const dataRows = rows.map(r => [
    toExcelSerial(r.Date),
    r.Vendor,
    r.Category,
    r['Amount (ZAR)'],
  ]);

  const aoa = [header, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Apply date format to column A (rows 2 onward)
  for (let i = 0; i < rows.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: i + 1, c: 0 });
    ws[cellRef].t = 'n';
    ws[cellRef].z = 'dd mmm yyyy';
  }

  // Apply 2-decimal format to column D (rows 2 onward)
  for (let i = 0; i < rows.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: i + 1, c: 3 });
    ws[cellRef].t = 'n';
    ws[cellRef].z = '0.00';
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Receipts');
  return wb;
}

export async function downloadWorkbook(wb: XLSX.WorkBook, filename: string): Promise<void> {
  XLSX.writeFile(wb, filename);
}
