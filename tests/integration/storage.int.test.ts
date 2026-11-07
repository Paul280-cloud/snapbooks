// T-BR3-2 storage integration: uploadPhoto validates file type/size and stores to Supabase Storage.
// Requires a running local Supabase instance (docker).
// Run with: npm run test:int -- --testPathPattern=storage.int

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = `int-storage-${Date.now()}@example.com`;
const PASS = 'StorePass1!';

let userClient: ReturnType<typeof createClient>;
let userId: string;

function makeFile(size: number, type: string, name: string): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

beforeAll(async () => {
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASS,
    email_confirm: true,
  });
  if (error) throw error;
  userId = data.user!.id;

  userClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInErr } = await userClient.auth.signInWithPassword({ email: EMAIL, password: PASS });
  if (signInErr) throw signInErr;
}, 30_000);

afterAll(async () => {
  if (userId) await admin.auth.admin.deleteUser(userId);
}, 30_000);

describe('T-BR3-2 uploadPhoto', () => {
  it('uploads a valid JPEG and returns the storage path', async () => {
    // Import dynamically so the module is real (not mocked in unit tests)
    const { uploadPhoto } = await import('../../src/lib/api/storage');
    const file = makeFile(1024, 'image/jpeg', 'receipt.jpg');
    const path = await uploadPhoto(userClient as never, userId, file);
    expect(path).toMatch(new RegExp(`^${userId}/`));
    expect(path).toMatch(/\.jpg$/);
  });

  it('uploads a valid PNG and returns the storage path', async () => {
    const { uploadPhoto } = await import('../../src/lib/api/storage');
    const file = makeFile(1024, 'image/png', 'receipt.png');
    const path = await uploadPhoto(userClient as never, userId, file);
    expect(path).toMatch(/\.png$/);
  });

  it('throws for a file that is too large (10 MB exactly)', async () => {
    const { uploadPhoto } = await import('../../src/lib/api/storage');
    const file = makeFile(10_485_760, 'image/jpeg', 'big.jpg');
    await expect(uploadPhoto(userClient as never, userId, file)).rejects.toThrow();
  });

  it('throws for an unsupported file type (GIF)', async () => {
    const { uploadPhoto } = await import('../../src/lib/api/storage');
    const file = makeFile(1024, 'image/gif', 'receipt.gif');
    await expect(uploadPhoto(userClient as never, userId, file)).rejects.toThrow();
  });
});
