import { isSessionExpired } from '../../src/lib/rules/session';
import type { Session } from '@supabase/supabase-js';

function makeSession(daysAgo: number): Session {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return { user: { last_sign_in_at: d.toISOString() } } as Session;
}

describe('isSessionExpired', () => {
  it('T-AUTH-3 expires a session last signed in 31 days ago', () => {
    expect(isSessionExpired(makeSession(31))).toBe(true);
  });

  it('T-AUTH-3 keeps a session last signed in 29 days ago', () => {
    expect(isSessionExpired(makeSession(29))).toBe(false);
  });

  it('T-AUTH-3 keeps a session that is exactly 30 days old', () => {
    expect(isSessionExpired(makeSession(30))).toBe(false);
  });
});
