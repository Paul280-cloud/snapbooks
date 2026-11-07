// T-EDGE-3, T-BR4-3, T-INT-4, T-BR6-2, T-INT-5
// Integration tests for receipt operations via the Supabase client.
// Requires a running local Supabase instance (docker).
// Run with: npm run test:int -- --testPathPattern=receipts.int

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ts = Date.now();
const EMAIL_A = `int-receipt-a-${ts}@example.com`;
const EMAIL_B = `int-receipt-b-${ts}@example.com`;
const PASS = 'IntPass1!';

let userAClient: ReturnType<typeof createClient>;
let userBClient: ReturnType<typeof createClient>;
let userAId: string;
let userBId: string;

async function signUpAndConfirm(email: string, pass: string) {
  const { data: signUpData, error: signUpErr } = await admin.auth.admin.createUser({
    email,
    password: pass,
    email_confirm: true,
  });
  if (signUpErr) throw signUpErr;
  return signUpData.user!.id;
}

async function makeClient(email: string, pass: string) {
  const client = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password: pass });
  if (error) throw error;
  return client;
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

describe('T-BR6-2 old receipts remain accessible', () => {
  it('a receipt dated 6 years ago is still listed and can be updated and deleted', async () => {
    const oldDate = '2020-01-15'; // 6+ years ago
    const receipt = await insertReceipt(userAClient, {
      vendor: 'Old Vendor',
      date: oldDate,
    });
    expect(receipt.id).toBeTruthy();

    // Still listed
    const { data: listed } = await userAClient
      .from('receipts')
      .select('*')
      .eq('id', receipt.id)
      .single();
    expect(listed?.date).toBe(oldDate);

    // Can be updated (OP14)
    const { error: updateErr } = await userAClient
      .from('receipts')
      .update({ vendor: 'Old Vendor Updated', amount: 50, date: oldDate, category: 'Other' })
      .eq('id', receipt.id);
    expect(updateErr).toBeNull();

    // Can be deleted (OP15)
    const { error: deleteErr } = await userAClient
      .from('receipts')
      .delete()
      .eq('id', receipt.id);
    expect(deleteErr).toBeNull();

    // Gone after delete
    const { data: gone } = await userAClient
      .from('receipts')
      .select('*')
      .eq('id', receipt.id)
      .maybeSingle();
    expect(gone).toBeNull();
  });
});

describe('T-INT-5 OP13/OP14/OP15 ownership enforcement', () => {
  let ownerReceiptId: string;

  beforeAll(async () => {
    const r = await insertReceipt(userAClient, { vendor: 'Owner Receipt' });
    ownerReceiptId = r.id;
  });

  it('OP13: owner can read their own receipt; other user gets nothing', async () => {
    // Owner reads
    const { data: own, error: ownErr } = await userAClient
      .from('receipts')
      .select('*')
      .eq('id', ownerReceiptId)
      .maybeSingle();
    expect(ownErr).toBeNull();
    expect(own?.vendor).toBe('Owner Receipt');

    // Other user reads — RLS returns empty (not an error, just no rows)
    const { data: other } = await userBClient
      .from('receipts')
      .select('*')
      .eq('id', ownerReceiptId)
      .maybeSingle();
    expect(other).toBeNull();
  });

  it('OP14: other user cannot update the owner\'s receipt', async () => {
    const { error } = await userBClient
      .from('receipts')
      .update({ vendor: 'Hacked' })
      .eq('id', ownerReceiptId);
    // RLS blocks the update — no rows affected, not an explicit error
    expect(error).toBeNull(); // no SQL error, but...

    // Verify the row was not changed
    const { data } = await userAClient
      .from('receipts')
      .select('vendor')
      .eq('id', ownerReceiptId)
      .single();
    expect(data?.vendor).toBe('Owner Receipt');
  });

  it('OP15: other user cannot delete the owner\'s receipt', async () => {
    const { error } = await userBClient
      .from('receipts')
      .delete()
      .eq('id', ownerReceiptId);
    expect(error).toBeNull(); // RLS silently blocks, no SQL error

    // Verify the row still exists for the owner
    const { data } = await userAClient
      .from('receipts')
      .select('id')
      .eq('id', ownerReceiptId)
      .maybeSingle();
    expect(data?.id).toBe(ownerReceiptId);
  });
});
