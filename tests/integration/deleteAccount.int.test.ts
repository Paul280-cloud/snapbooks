import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const edgeFunctionUrl = `${supabaseUrl}/functions/v1/delete-account`;

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAIL = `del-test-${Date.now()}@example.com`;
const TEST_PASS = 'DelPass1!';
let accessToken: string;
let userId: string;

beforeAll(async () => {
  const { data: signUpData } = await anonClient.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASS,
    options: { data: { display_name: 'Del Test', is_18_or_older: true } },
  });
  userId = signUpData.user!.id;
  await adminClient.auth.admin.updateUserById(userId, { email_confirm: true });
  const { data } = await anonClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASS,
  });
  accessToken = data.session!.access_token;
});

afterAll(async () => {
  const { data } = await adminClient.auth.admin.listUsers();
  const user = data.users.find((u) => u.email === TEST_EMAIL);
  if (user) await adminClient.auth.admin.deleteUser(user.id);
});

describe('Delete account Edge Function', () => {
  it('T-SEC-3a rejects request with no Authorization header', async () => {
    const res = await fetch(edgeFunctionUrl, { method: 'POST' });
    expect(res.status).toBe(401);
  });

  it('T-SEC-3b rejects request with an invalid token', async () => {
    const res = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid.token.here' },
    });
    expect(res.status).toBe(401);
  });

  it('T-INT-2 deletes the account and all data when called with a valid token', async () => {
    const res = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);

    // User no longer in auth.users
    const { data: listData } = await adminClient.auth.admin.listUsers();
    const stillExists = listData.users.some((u) => u.id === userId);
    expect(stillExists).toBe(false);

    // Profile row was cascade-deleted
    const { data: profile, error } = await adminClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    expect(error).toBeNull();
    expect(profile).toBeNull();
  });
});
