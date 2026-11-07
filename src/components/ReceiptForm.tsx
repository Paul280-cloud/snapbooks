import { CATEGORIES } from '../lib/rules/categories';
import type { ReceiptErrors, ReceiptFormData } from '../lib/rules/receipt';

interface Props {
  values: ReceiptFormData;
  onChange: (field: keyof ReceiptFormData, value: string) => void;
  onSave: () => void;
  loading: boolean;
  disabled?: boolean;
  errors: ReceiptErrors;
}

export default function ReceiptForm({
  values,
  onChange,
  onSave,
  loading,
  disabled = false,
  errors,
}: Props) {
  const amountNum = parseFloat(values.amount);
  const allFilled =
    values.vendor.trim() !== '' &&
    values.amount !== '' &&
    !isNaN(amountNum) &&
    amountNum > 0 &&
    values.date !== '' &&
    values.category !== '';

  const saveDisabled = loading || disabled || !allFilled;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">
          Vendor
        </label>
        <input
          id="vendor"
          type="text"
          maxLength={100}
          placeholder="Shop or restaurant name"
          value={values.vendor}
          onChange={(e) => onChange('vendor', e.target.value)}
          className="mt-1 w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7F4F]"
        />
        {errors.vendor && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.vendor}</p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={values.amount}
          onChange={(e) => onChange('amount', e.target.value)}
          className="mt-1 w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7F4F]"
        />
        {errors.amount && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.amount}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={values.date}
          onChange={(e) => onChange('date', e.target.value)}
          className="mt-1 w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7F4F]"
        />
        {errors.date && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.date}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={values.category}
          onChange={(e) => onChange('category', e.target.value)}
          className="mt-1 w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7F4F]"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.category}</p>
        )}
      </div>

      <button
        type="button"
        disabled={saveDisabled}
        onClick={onSave}
        className="rounded-[6px] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 enabled:bg-[#1B7F4F] enabled:text-white enabled:hover:bg-[#166840]"
      >
        {loading ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
