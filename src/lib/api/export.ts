import { supabase } from '../supabase';
import type { Receipt } from './receipts';

export async function fetchReceiptsForExport(start: string, end: string): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })
    .limit(500);

  if (error) throw new Error(error.message);
  return (data ?? []) as Receipt[];
}
