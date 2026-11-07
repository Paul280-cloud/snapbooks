import type { Session } from '@supabase/supabase-js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function isSessionExpired(session: Session): boolean {
  const lastSignIn = session.user?.last_sign_in_at;
  if (!lastSignIn) return true;
  return Date.now() - new Date(lastSignIn).getTime() > THIRTY_DAYS_MS;
}
