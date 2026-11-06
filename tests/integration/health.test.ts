import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';

describe('T-SETUP-3 Supabase client connects to the local backend', () => {
  it('can reach the local Supabase instance', async () => {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await client.from('users').select('id').limit(0);
    expect(error).toBeNull();
  });
});
