import { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useSession } from '../hooks/useSession';
import { fetchReceiptsForExport } from '../lib/api/export';
import {
  buildExportRows,
  buildWorkbook,
  exportFileName,
  downloadWorkbook,
} from '../lib/rules/export';
import { taxYearFor } from '../lib/rules/taxYear';
import OfflineBanner from '../components/OfflineBanner';
import Toast from '../components/Toast';

export default function Export() {
  const isOnline = useOnlineStatus();
  useSession();

  const taxYear = taxYearFor(new Date());
  const [start, setStart] = useState(taxYear.start);
  const [end, setEnd] = useState(taxYear.end);
  const [count, setCount] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setCount(null);
    fetchReceiptsForExport(start, end).then(receipts => {
      setCount(receipts.length);
    });
  }, [start, end]);

  async function handleExport() {
    setIsExporting(true);
    try {
      const receipts = await fetchReceiptsForExport(start, end);
      const rows = buildExportRows(receipts, start, end);
      const wb = buildWorkbook(rows);
      const filename = exportFileName(new Date());
      await downloadWorkbook(wb, filename);
      setToast('Export ready.');
    } finally {
      setIsExporting(false);
    }
  }

  const exportDisabled = !isOnline || isExporting || count === 0;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <OfflineBanner offline={!isOnline} />

      <header className="bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto max-w-[1200px]">
          <span className="text-lg font-bold text-[#1B7F4F]">SnapBooks</span>
        </div>
      </header>

      <main className="mx-auto max-w-[600px] px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-[#111827]">Export receipts</h1>

        <div className="rounded-[8px] bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="export-start" className="mb-1 block text-sm font-medium text-[#374151]">
                Start date
              </label>
              <input
                id="export-start"
                type="date"
                value={start}
                onChange={e => setStart(e.target.value)}
                className="w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7F4F]"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="export-end" className="mb-1 block text-sm font-medium text-[#374151]">
                End date
              </label>
              <input
                id="export-end"
                type="date"
                value={end}
                onChange={e => setEnd(e.target.value)}
                className="w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7F4F]"
              />
            </div>
          </div>

          {/* Summary line */}
          <p className="mb-2 text-sm text-[#6B7280]">
            {count === null
              ? 'Loading…'
              : count === 0
              ? 'No receipts in that range. Adjust the dates and try again.'
              : `${count} ${count === 1 ? 'receipt' : 'receipts'} found in this range`}
          </p>

          {/* Note line */}
          <p className="mb-6 text-xs text-[#9CA3AF]">
            File format: .xlsx · Columns: Date, Vendor, Category, Amount (ZAR) · Sorted oldest first
          </p>

          <button
            type="button"
            disabled={exportDisabled}
            onClick={handleExport}
            className="w-full rounded-[6px] bg-[#1B7F4F] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 hover:bg-[#166840]"
          >
            {isExporting ? 'Exporting…' : 'Export to spreadsheet'}
          </button>
        </div>
      </main>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
