// T-INT-7: OP17 returns only the user's own receipts in the current tax year.
// Requires a running local Supabase instance (docker).
// Run with: npm run test:int -- --testPathPattern=dashboard.int

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey    = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ts = Date.now();
const EMAIL_A = `int-dash-a-${ts}@example.com`;
const EMAIL_B = `int-dash-b-${ts}@example.com`;
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
  amount = 100,
  category = 'Other',
) {
  const { data, error } = await client.from('receipts').insert({
    vendor: 'Test',
    amount,
    date,
    category,
    photo_url: `${userId}/dash-int-${Date.now()}-${Math.random()}.jpg`,
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

describe('T-INT-7 dashboard tax year query', () => {
  const taxStart = '2025-03-01';
  const taxEnd   = '2026-02-28';

  it('returns receipts inside the tax year (both end dates inclusive)', async () => {
    // Insert: on start date, inside, on end date, before start, after end
    await insertReceipt(userAClient, userAId, taxStart,    200, 'Fuel');   // on start
    await insertReceipt(userAClient, userAId, '2025-08-15', 300, 'Stock'); // inside
    await insertReceipt(userAClient, userAId, taxEnd,       400, 'Food');  // on end
    await insertReceipt(userAClient, userAId, '2025-02-28', 999, 'Other'); // before start
    await insertReceipt(userAClient, userAId, '2026-03-01', 999, 'Rent'); // after end

    const { data, error } = await userAClient
      .from('receipts')
      .select('date, amount, category')
      .gte('date', taxStart)
      .lte('date', taxEnd);

    expect(error).toBeNull();
    const amounts = (data ?? []).map((r: { amount: number }) => r.amount);
    expect(amounts).toContain(200);
    expect(amounts).toContain(300);
    expect(amounts).toContain(400);
    expect(amounts).not.toContain(999);
  });

  it('returns only the authenticated user\'s own receipts (RLS)', async () => {
    const date = '2025-11-10';
    await insertReceipt(userAClient, userAId, date, 150, 'Food');
    await insertReceipt(userBClient, userBId, date, 250, 'Fuel');

    const { data } = await userAClient
      .from('receipts')
      .select('date, amount, category')
      .gte('date', taxStart)
      .lte('date', taxEnd);

    const amounts = (data ?? []).map((r: { amount: number }) => r.amount);
    expect(amounts).toContain(150);
    expect(amounts).not.toContain(250);
  });
});
