import { Link } from 'react-router-dom';
import { formatRand } from '../lib/rules/money';
import type { Receipt } from '../lib/api/receipts';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${parseInt(day, 10)} ${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

const CATEGORY_COLORS: Record<string, string> = {
  Fuel: '#F59E0B',
  Food: '#22C55E',
  Stock: '#3B82F6',
  Rent: '#8B5CF6',
  Other: '#9CA3AF',
};

interface ReceiptCardProps {
  receipt: Receipt;
}

export default function ReceiptCard({ receipt }: ReceiptCardProps) {
  const { id, vendor, amount, date, category } = receipt;
  const dotColor = CATEGORY_COLORS[category] ?? '#9CA3AF';

  return (
    <Link
      to={`/receipts/${id}`}
      className="flex items-center gap-3 rounded-[8px] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-colors"
    >
      <span
        data-testid="category-dot"
        aria-hidden="true"
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#111827]">{vendor}</p>
        <p className="text-sm text-[#6B7280]">{formatDate(date)}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-semibold text-[#111827]">{formatRand(amount)}</p>
        <p className="text-sm text-[#6B7280]">{category}</p>
      </div>
    </Link>
  );
}
