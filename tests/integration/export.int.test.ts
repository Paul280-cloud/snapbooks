// T-INT-6: OP16 returns only the user's own receipts in the given date range (both ends inclusive).
// Requires a running local Supabase instance (docker).
// Run with: npm run test:int -- --testPathPattern=export.int

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ts = Date.now();
const EMAIL_A = `int-export-a-${ts}@example.com`;
const EMAIL_B = `int-export-b-${ts}@example.com`;
const PASS = 'IntPass1!';

let userAClient: ReturnType<typeof createClient>;
let userBClient: ReturnType<typeof createClient>;
let userAId: string;
let userBId: string;

async function signUpAndConfirm(email: string, pass: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: pass,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user!.id;
}

async function makeClient(email: string, pass: string) {
  const c = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await c.auth.signInWithPassword({ email, password: pass });
  if (error) throw error;
  return c;
}

async function insertReceipt(
  client: ReturnType<typeof createClient>,
  userId: string,
  date: string,
  vendor = 'Test',
) {
  const { data, error } = await client.from('receipts').insert({
    vendor,
    amount: 100,
    date,
    category: 'Other',
    photo_url: `${userId}/export-int-${Date.now()}.jpg`,
  }).select().single();
  if (error) throw error;
  return data;
}

beforeAll(async () => {
  userAId = await signUpAndConfirm(EMAIL_A, PASS);
  userBId = await signUpAndConfirm(EMAIL_B, PASS);
  userAClient = await makeClient(EMAIL_A, PASS);
  userBClient = await makeClient(EMAIL_B, PASS);
}, 30_000);

afterAll(async () => {
  if (userAId) await admin.auth.admin.deleteUser(userAId);
  if (userBId) await admin.auth.admin.deleteUser(userBId);
}, 30_000);

describe('T-INT-6 export date range', () => {
  it('returns only receipts within the range, both end dates inclusive', async () => {
    const start = '2025-03-01';
    const end   = '2025-05-31';

    // Insert: exactly on start, within, exactly on end, before, after
    await insertReceipt(userAClient, userAId, start, 'On Start');
    await insertReceipt(userAClient, userAId, '2025-04-15', 'Inside');
    await insertReceipt(userAClient, userAId, end, 'On End');
    await insertReceipt(userAClient, userAId, '2025-02-28', 'Before');
    await insertReceipt(userAClient, userAId, '2025-06-01', 'After');

    const { data, error } = await userAClient
      .from('receipts')
      .select('*')
      .gte('date', start)
      .lte('date', end);

    expect(error).toBeNull();
    const vendors = (data ?? []).map((r: { vendor: string }) => r.vendor);
    expect(vendors).toContain('On Start');
    expect(vendors).toContain('Inside');
    expect(vendors).toContain('On End');
    expect(vendors).not.toContain('Before');
    expect(vendors).not.toContain('After');
  });

  it('returns only the authenticated user\'s own receipts (not another user\'s)', async () => {
    const date = '2025-07-10';
    // Insert one receipt for each user on the same date
    await insertReceipt(userAClient, userAId, date, 'User A Receipt');
    await insertReceipt(userBClient, userBId, date, 'User B Receipt');

    // userA only sees their own
    const { data } = await userAClient
      .from('receipts')
      .select('vendor')
      .gte('date', date)
      .lte('date', date);

    const vendors = (data ?? []).map((r: { vendor: string }) => r.vendor);
    expect(vendors).toContain('User A Receipt');
    expect(vendors).not.toContain('User B Receipt');
  });
});
