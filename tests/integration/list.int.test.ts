import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PAGE_SIZE = 20;
const TEST_EMAIL_A = `int-list-a-${Date.now()}@example.com`;
const TEST_EMAIL_B = `int-list-b-${Date.now()}@example.com`;
const TEST_PASS = 'TestList1!';

let userAId: string;
let userBId: string;
let userAClient: SupabaseClient;

function makeReceiptRow(ownerId: string, i: number, overrides?: object) {
  return {
    owner_id: ownerId,
    photo_url: `${ownerId}/test-${i}.jpg`,
    vendor: `Vendor ${String(i).padStart(3, '0')}`,
    amount: 100 + i,
    date: `2026-${String(Math.floor(i / 10) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    category: (['Food', 'Stock', 'Fuel', 'Rent', 'Other'] as const)[i % 5],
    ...overrides,
  };
}

beforeAll(async () => {
  // Create user A with 25 receipts
  const { data: a } = await adminClient.auth.admin.createUser({
    email: TEST_EMAIL_A,
    password: TEST_PASS,
    email_confirm: true,
    user_metadata: { is_18_or_older: true, display_name: 'List Test A' },
  });
  userAId = a.user!.id;

  // Create user B with 3 receipts
  const { data: b } = await adminClient.auth.admin.createUser({
    email: TEST_EMAIL_B,
    password: TEST_PASS,
    email_confirm: true,
    user_metadata: { is_18_or_older: true, display_name: 'List Test B' },
  });
  userBId = b.user!.id;

  // Insert 25 receipts for user A via service role (bypasses RLS)
  const aReceipts = Array.from({ length: 25 }, (_, i) => makeReceiptRow(userAId, i));
  await adminClient.from('receipts').insert(aReceipts);

  // Insert 3 receipts for user B
  const bReceipts = Array.from({ length: 3 }, (_, i) =>
    makeReceiptRow(userBId, i, { vendor: `B Vendor ${i}` }),
  );
  await adminClient.from('receipts').insert(bReceipts);

  // Sign in as user A to get a session
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: session } = await anonClient.auth.signInWithPassword({
    email: TEST_EMAIL_A,
    password: TEST_PASS,
  });
  userAClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${session.session!.access_token}` },
    },
    auth: { autoRefreshToken: false, persistSession: false },
  });
});

afterAll(async () => {
  if (userAId) await adminClient.auth.admin.deleteUser(userAId);
  if (userBId) await adminClient.auth.admin.deleteUser(userBId);
});

describe('T-INT-3 OP12 list receipts', () => {
  it('returns at most 20 receipts per page (page 0)', async () => {
    const { data, error } = await userAClient
      .from('receipts')
      .select('*', { count: 'exact' })
      .eq('owner_id', userAId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1);
    expect(error).toBeNull();
    expect(data).toHaveLength(PAGE_SIZE);
  });

  it('returns the correct total count', async () => {
    const { count, error } = await userAClient
      .from('receipts')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userAId);
    expect(error).toBeNull();
    expect(count).toBe(25);
  });

  it('page 1 returns the remaining 5 receipts', async () => {
    const { data, error } = await userAClient
      .from('receipts')
      .select('*')
      .eq('owner_id', userAId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(PAGE_SIZE, PAGE_SIZE * 2 - 1);
    expect(error).toBeNull();
    expect(data).toHaveLength(5);
  });

  it('filters by category', async () => {
    const { data, error } = await userAClient
      .from('receipts')
      .select('*')
      .eq('owner_id', userAId)
      .eq('category', 'Fuel')
      .order('date', { ascending: false });
    expect(error).toBeNull();
    expect(data!.every((r) => r.category === 'Fuel')).toBe(true);
    // 25 receipts: indices 2,7,12,17,22 are Fuel (every 5th, starting at index 2)
    expect(data).toHaveLength(5);
  });

  it('filters by month', async () => {
    // month 2026-01: indices 0–9 → dates 2026-01-01 to 2026-01-10
    const { data, error } = await userAClient
      .from('receipts')
      .select('*')
      .eq('owner_id', userAId)
      .gte('date', '2026-01-01')
      .lt('date', '2026-02-01')
      .order('date', { ascending: false });
    expect(error).toBeNull();
    expect(data!.every((r) => r.date.startsWith('2026-01'))).toBe(true);
  });

  it('filters by vendor search (ilike)', async () => {
    // Insert a distinctive vendor for exact search test
    await adminClient.from('receipts').insert({
      owner_id: userAId,
      photo_url: `${userAId}/search-test.jpg`,
      vendor: 'UniqueSearchVendorXYZ',
      amount: 42.0,
      date: '2026-03-01',
      category: 'Other',
    });

    const { data, error } = await userAClient
      .from('receipts')
      .select('*')
      .eq('owner_id', userAId)
      .ilike('vendor', '%uniquesearchvendorxyz%');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].vendor).toBe('UniqueSearchVendorXYZ');
  });

  it('never returns another user\'s receipts (RLS)', async () => {
    const { data, error } = await userAClient
      .from('receipts')
      .select('*')
      .eq('owner_id', userBId);
    expect(error).toBeNull();
    // RLS should ensure this returns nothing even if owner_id filter is explicit
    expect(data).toHaveLength(0);
  });

  it('receipts are ordered newest (date desc) first', async () => {
    const { data, error } = await userAClient
      .from('receipts')
      .select('date')
      .eq('owner_id', userAId)
      .order('date', { ascending: false })
      .limit(5);
    expect(error).toBeNull();
    const dates = data!.map((r) => r.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });
});
