import { CATEGORIES } from './categories';
import { isFutureInSAST } from './date';

export interface ReceiptFormData {
  vendor: string;
  amount: string;
  date: string;
  category: string;
}

export type ReceiptErrors = Partial<Record<keyof ReceiptFormData, string>>;

export function validateReceipt(data: ReceiptFormData): ReceiptErrors {
  const errors: ReceiptErrors = {};

  if (!data.vendor.trim()) {
    errors.vendor = 'Enter a vendor name.';
  }

  const amountNum = parseFloat(data.amount);
  if (!data.amount || isNaN(amountNum) || amountNum <= 0) {
    errors.amount = 'Enter a rand amount, e.g. 89.99.';
  }

  if (!data.date || isFutureInSAST(data.date, new Date())) {
    errors.date = 'Enter a date that is not in the future.';
  }

  if (!data.category || !(CATEGORIES as string[]).includes(data.category)) {
    errors.category = 'Select a category.';
  }

  return errors;
}
