// T-EDGE-3, T-BR4-3, T-INT-4
// Integration tests for createReceipt via the Supabase client.
// Requires a running local Supabase instance (docker).
// Run with: npm run test:int -- --testPathPattern=receipts.int

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL_A = `int-receipt-a-${Date.now()}@example.com`;
const PASS = 'IntPass1!';

let userAClient: ReturnType<typeof createClient>;
let userAId: string;

async function signUpAndConfirm(email: string, pass: string) {
  const { data: signUpData, error: signUpErr } = await admin.auth.admin.createUser({
    email,
    password: pass,
    email_confirm: true,
  });
  if (signUpErr) throw signUpErr;
  return signUpData.user!.id;
}

beforeAll(async () => {
  userAId = await signUpAndConfirm(EMAIL_A, PASS);

  userAClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await userAClient.auth.signInWithPassword({ email: EMAIL_A, password: PASS });
  if (error) throw error;
}, 30_000);

afterAll(async () => {
  if (userAId) await admin.auth.admin.deleteUser(userAId);
}, 30_000);

async function insertReceipt(client: ReturnType<typeof createClient>, overrides = {}) {
  const { data, error } = await client.from('receipts').insert({
    vendor: 'Test Vendor',
    amount: 100,
    date: '2026-03-12',
    category: 'Food',
    photo_url: `${userAId}/test.jpg`,
    ...overrides,
  }).select().single();
  if (error) throw error;
  return data;
}

describe('T-INT-4 createReceipt', () => {
  it('inserts a receipt and returns it with an id', async () => {
    const receipt = await insertReceipt(userAClient);
    expect(receipt.id).toBeTruthy();
    expect(receipt.vendor).toBe('Test Vendor');
    expect(receipt.amount).toBe(100);
  });

  it('the inserted receipt appears in the user list', async () => {
    const receipt = await insertReceipt(userAClient, { vendor: 'Unique Vendor INT4' });
    const { data, error } = await userAClient
      .from('receipts')
      .select('*')
      .eq('id', receipt.id)
      .single();
    expect(error).toBeNull();
    expect(data?.vendor).toBe('Unique Vendor INT4');
  });
});

describe('T-BR4-3 limit at 500', () => {
  it('still allows insertions below the 500 limit (no DB-level rejection below limit)', async () => {
    // Insert one more receipt — we just need to confirm the DB allows it.
    const receipt = await insertReceipt(userAClient, { vendor: 'Limit Test' });
    expect(receipt.id).toBeTruthy();
    // Note: the 500 limit is enforced at the application layer (isAtReceiptLimit).
    // We confirm here that the DB itself will accept up to N receipts; the app stops at 500.
  });
});

describe('T-EDGE-3 duplicate photo path', () => {
  it('rejects a second receipt with the same photo_url for the same user', async () => {
    const photoUrl = `${userAId}/edge3-unique-${Date.now()}.jpg`;
    await insertReceipt(userAClient, { photo_url: photoUrl });
    const { error } = await userAClient.from('receipts').insert({
      vendor: 'Duplicate',
      amount: 50,
      date: '2026-03-12',
      category: 'Other',
      photo_url: photoUrl,
    });
    // Expects a unique constraint violation
    expect(error).not.toBeNull();
    expect(error?.code).toMatch(/23505|unique/i);
  });
});
