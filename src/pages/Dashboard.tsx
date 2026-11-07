import { useState, useEffect, useCallback } from 'react';
import { useSession } from '../hooks/useSession';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { fetchDashboardData, type DashboardRow } from '../lib/api/dashboard';
import { taxYearFor } from '../lib/rules/taxYear';
import { sumRand, formatRand } from '../lib/rules/money';
import {
  formatTaxYearLabel,
  computeCategoryTotals,
  computeMonthTotals,
} from '../lib/rules/dashboard';
import BarChart from '../components/BarChart';
import LoadingPlaceholder from '../components/LoadingPlaceholder';
import OfflineBanner from '../components/OfflineBanner';
import TabBar from '../components/TabBar';

export default function Dashboard() {
  useSession();
  const isOnline = useOnlineStatus();
  const taxYear = taxYearFor(new Date());

  const [rows, setRows] = useState<DashboardRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    fetchDashboardData(taxYear.start, taxYear.end)
      .then(data => { setRows(data); setIsLoading(false); })
      .catch(() => { setIsError(true); setIsLoading(false); });
  }, [taxYear.start, taxYear.end]);

  useEffect(() => { load(); }, [load]);

  const taxYearLabel = formatTaxYearLabel(taxYear.start, taxYear.end);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <OfflineBanner offline={!isOnline} />

      <header className="bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto max-w-[1200px]">
          <span className="text-lg font-bold text-[#1B7F4F]">Dashboard</span>
        </div>
      </header>

      <main className="mx-auto max-w-[600px] px-4 py-6 pb-20">
        <p className="mb-4 text-sm text-[#6B7280]">{taxYearLabel}</p>

        {isLoading && (
          <div>
            <div data-testid="loading-placeholder">
              <LoadingPlaceholder type="cards" count={3} />
            </div>
          </div>
        )}

        {isError && (
          <div className="text-center">
            <p className="text-[#DC2626]">Something went wrong. Try again.</p>
            <button
              type="button"
              onClick={load}
              className="mt-2 rounded-[6px] border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && rows !== null && rows.length === 0 && (
          <div className="flex flex-col items-center py-12">
            <p className="text-center text-[#6B7280]">
              No data yet. Upload receipts to see your spending summary.
            </p>
          </div>
        )}

        {!isLoading && !isError && rows !== null && rows.length > 0 && (
          <>
            <BarChart
              items={computeCategoryTotals(rows)}
              title="Spend by category"
            />
            <BarChart
              items={computeMonthTotals(rows, taxYear.start)}
              title="Spend by month"
            />
            <p className="mt-2 text-base font-semibold text-[#111827]">
              Total expenses: {formatRand(sumRand(rows.map(r => r.amount)))}
            </p>
          </>
        )}
      </main>

      <TabBar />
    </div>
  );
}
