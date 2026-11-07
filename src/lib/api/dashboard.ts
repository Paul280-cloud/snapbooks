import { supabase } from '../supabase';
import type { Category } from '../rules/categories';

export interface DashboardRow {
  date: string;
  amount: number;
  category: Category;
}

export async function fetchDashboardData(start: string, end: string): Promise<DashboardRow[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('date, amount, category')
    .gte('date', start)
    .lte('date', end);

  if (error) throw new Error(error.message);
  return (data ?? []) as DashboardRow[];
}
