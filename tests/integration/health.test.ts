import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

describe('T-SETUP-3 Supabase client connects to the local backend', () => {
  it('can reach the local Supabase instance', async () => {
    // Use service role to bypass RLS — we only need to verify connectivity
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await client.from('users').select('id').limit(0);
    expect(error).toBeNull();
  });
});
