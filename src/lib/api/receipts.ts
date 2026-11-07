import { supabase } from '../supabase';
import type { Category } from '../rules/categories';

export type { Category };

export interface Receipt {
  id: string;
  owner_id: string;
  vendor: string;
  amount: number;
  date: string;
  category: Category;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

export interface ListReceiptsParams {
  page?: number;
  category?: string;
  month?: string;
  search?: string;
}

export interface ListReceiptsResult {
  receipts: Receipt[];
  count: number;
}

const PAGE_SIZE = 20;

export async function listReceipts({
  page = 0,
  category,
  month,
  search,
}: ListReceiptsParams = {}): Promise<ListReceiptsResult> {
  let query = supabase
    .from('receipts')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (category) {
    query = query.eq('category', category);
  }

  if (month) {
    const [year, mon] = month.split('-');
    const paddedMon = mon.padStart(2, '0');
    const start = `${year}-${paddedMon}-01`;
    const nextMonNum = parseInt(mon, 10) + 1;
    const nextYear = nextMonNum > 12 ? parseInt(year, 10) + 1 : parseInt(year, 10);
    const nextMon = (nextMonNum > 12 ? 1 : nextMonNum).toString().padStart(2, '0');
    const end = `${nextYear}-${nextMon}-01`;
    query = query.gte('date', start).lt('date', end);
  }

  if (search && search.trim()) {
    query = query.ilike('vendor', `%${search.trim()}%`);
  }

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);
  return { receipts: (data as Receipt[]) ?? [], count: count ?? 0 };
}
