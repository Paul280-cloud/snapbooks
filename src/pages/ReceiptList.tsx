import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { listReceipts } from '../lib/api/receipts';
import { CATEGORIES } from '../lib/rules/categories';
import { isAtReceiptLimit } from '../lib/rules/limit';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import ReceiptCard from '../components/ReceiptCard';
import OfflineBanner from '../components/OfflineBanner';
import LoadingPlaceholder from '../components/LoadingPlaceholder';
import Toast from '../components/Toast';

export default function ReceiptList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState('');
  const isOnline = useOnlineStatus();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null,
  );

  const hasFilters = !!(search || category || month);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['receipts', { category: category || undefined, month: month || undefined, search: search || undefined }],
    queryFn: ({ pageParam }) =>
      listReceipts({
        page: pageParam as number,
        category: category || undefined,
        month: month || undefined,
        search: search || undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.receipts.length, 0);
      return loaded < lastPage.count ? allPages.length : undefined;
    },
  });

  const totalCount = data?.pages[0]?.count ?? 0;
  const allReceipts = data?.pages.flatMap((p) => p.receipts) ?? [];
  const atLimit = isAtReceiptLimit(totalCount);

  // Intersection observer for infinite scroll
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  function clearFilters() {
    setSearch('');
    setCategory('');
    setMonth('');
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) navigate('/receipts/new', { state: { file } });
    // Reset so the same file can be selected again
    e.target.value = '';
  }

  const uploadDisabled = atLimit || !isOnline;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <OfflineBanner offline={!isOnline} />

      {/* Header */}
      <header className="bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <span className="text-lg font-bold text-[#1B7F4F]">SnapBooks</span>
          <span className="text-sm text-[#6B7280]">
            {totalCount} {totalCount === 1 ? 'receipt' : 'receipts'}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 py-4 lg:flex lg:gap-6">
        {/* Filters */}
        <aside className="mb-4 lg:mb-0 lg:w-64 lg:shrink-0">
          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="search-input" className="sr-only">
                Search
              </label>
              <input
                id="search-input"
                role="searchbox"
                type="search"
                placeholder="Search vendor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7F4F]"
              />
            </div>
            <div>
              <label htmlFor="category-filter" className="sr-only">
                Category
              </label>
              <select
                id="category-filter"
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7F4F]"
              >
                <option value="">All</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="month-filter" className="sr-only">
                Month
              </label>
              <input
                id="month-filter"
                type="month"
                aria-label="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7F4F]"
              />
            </div>
          </div>
        </aside>

        {/* List */}
        <main className="flex-1">
          {/* Limit reached banner */}
          {atLimit && (
            <div
              role="alert"
              className="mb-4 rounded-[8px] bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              You've reached the 500-receipt limit for this account.
            </div>
          )}

          {/* Upload button */}
          <div className="mb-4 flex justify-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
              aria-hidden="true"
            />
            <button
              type="button"
              disabled={uploadDisabled}
              aria-label="Upload receipt"
              onClick={() => fileInputRef.current?.click()}
              className="inline-block rounded-[6px] bg-[#1B7F4F] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 hover:bg-[#166840]"
            >
              + Upload receipt
            </button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} data-testid="loading-placeholder">
                  <LoadingPlaceholder type="cards" count={1} />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center">
              <p className="text-[#DC2626]">Something went wrong. Try again.</p>
              <button
                onClick={() => refetch()}
                className="mt-2 rounded-[6px] border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state — no receipts at all */}
          {!isLoading && !isError && allReceipts.length === 0 && !hasFilters && (
            <div className="flex flex-col items-center py-12">
              <p className="text-[#6B7280]">
                No receipts yet. Tap Upload to add your first receipt.
              </p>
            </div>
          )}

          {/* Filtered empty state */}
          {!isLoading && !isError && allReceipts.length === 0 && hasFilters && (
            <div className="flex flex-col items-center py-12">
              <p className="text-[#6B7280]">
                No receipts match that filter. Clear filters to see all.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-[#1B7F4F] underline hover:no-underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Receipt list */}
          {!isLoading && !isError && allReceipts.length > 0 && (
            <div className="flex flex-col gap-2">
              {allReceipts.map((receipt) => (
                <ReceiptCard key={receipt.id} receipt={receipt} />
              ))}
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <span className="text-sm text-[#6B7280]">Loading more…</span>
                </div>
              )}
            </div>
          )}

          {/* Scroll sentinel */}
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        </main>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
