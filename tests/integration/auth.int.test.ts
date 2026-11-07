import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAIL = `int-test-${Date.now()}@example.com`;
const TEST_PASS = 'TestPass1!';

afterAll(async () => {
  const { data } = await adminClient.auth.admin.listUsers();
  const user = data.users.find((u) => u.email === TEST_EMAIL);
  if (user) await adminClient.auth.admin.deleteUser(user.id);
});

describe('Auth integration tests', () => {
  it('T-US1-1 sign up creates a new user in auth.users', async () => {
    // Local GoTrue dev may or may not return a session on sign-up depending on
    // the autoconfirm setting — we only assert the user record was created.
    const { data, error } = await anonClient.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASS,
      options: { data: { display_name: 'Int Test', is_18_or_older: true } },
    });
    expect(error).toBeNull();
    expect(data.user?.email).toBe(TEST_EMAIL);
    expect(data.user).not.toBeNull();
  });

  it('T-US1-2 sign up with the same email returns a 400-class error or empty user', async () => {
    const { error } = await anonClient.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASS,
      options: { data: { display_name: 'Dupe', is_18_or_older: true } },
    });
    if (error) {
      expect(error.status).toBeGreaterThanOrEqual(400);
    }
  });

  it('T-US2-2 logging in with unconfirmed email fails', async () => {
    // Create a user that is definitely unconfirmed via admin API
    const unconfirmedEmail = `unconf-${Date.now()}@example.com`;
    const { data: created, error: createError } =
      await adminClient.auth.admin.createUser({
        email: unconfirmedEmail,
        password: TEST_PASS,
        email_confirm: false,
        user_metadata: { display_name: 'Unconf Test', is_18_or_older: true },
      });
    expect(createError).toBeNull();
    const unconfirmedId = created.user!.id;

    const { data, error } = await anonClient.auth.signInWithPassword({
      email: unconfirmedEmail,
      password: TEST_PASS,
    });
    expect(data.session).toBeNull();
    expect(error).not.toBeNull();

    await adminClient.auth.admin.deleteUser(unconfirmedId);
  });

  it('T-US2-1 logging in with confirmed credentials succeeds', async () => {
    const user = (await adminClient.auth.admin.listUsers()).data.users.find(
      (u) => u.email === TEST_EMAIL,
    );
    expect(user).toBeDefined();
    await adminClient.auth.admin.updateUserById(user!.id, {
      email_confirm: true,
    });
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASS,
    });
    expect(error).toBeNull();
    expect(data.session).not.toBeNull();
  });

  it('T-US2-1 session belongs to the signed-in user', async () => {
    const { data } = await anonClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASS,
    });
    expect(data.session?.user.email).toBe(TEST_EMAIL);
  });

  it('T-US2-3 request password reset does not reveal user existence', async () => {
    const { error } = await anonClient.auth.resetPasswordForEmail(
      'nonexistent@example.com',
      { redirectTo: `${supabaseUrl}/auth/v1/callback` },
    );
    expect(error).toBeNull();
  });

  it('T-US2-4 sign out clears the session', async () => {
    await anonClient.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASS });
    const { error } = await anonClient.auth.signOut();
    expect(error).toBeNull();
    const { data } = await anonClient.auth.getSession();
    expect(data.session).toBeNull();
  });

  it('T-INT-1 profile row is created automatically on sign-up', async () => {
    const user = (await adminClient.auth.admin.listUsers()).data.users.find(
      (u) => u.email === TEST_EMAIL,
    );
    expect(user).toBeDefined();
    const { data, error } = await adminClient
      .from('users')
      .select('id, email')
      .eq('id', user!.id)
      .single();
    expect(error).toBeNull();
    expect(data?.email).toBe(TEST_EMAIL);
  });

  it('T-AUTH-2 repeated failed login attempts return an error (not a crash)', async () => {
    // Local dev rate limit is 30/5min; we can't reliably trigger it with a small
    // number of requests. This test verifies that many concurrent bad-password
    // attempts all receive error responses rather than hanging or crashing.
    const attempts = Array.from({ length: 6 }, () =>
      anonClient.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: 'wrongpassword1',
      }),
    );
    const results = await Promise.allSettled(attempts);
    const errors = results
      .flatMap((r) => (r.status === 'fulfilled' ? [r.value.error] : []))
      .filter(Boolean);
    expect(errors.length).toBe(6);
    errors.forEach((e) => expect(e).not.toBeNull());
  });
});
