const RECEIPT_LIMIT = 500;

export function isAtReceiptLimit(count: number): boolean {
  return count >= RECEIPT_LIMIT;
}
