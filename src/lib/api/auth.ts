import { supabase } from '../supabase';

export type AuthError =
  | 'already_registered'
  | 'email_not_confirmed'
  | 'rate_limited'
  | 'invalid_credentials'
  | 'unknown';

function classifyError(message: string): AuthError {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('user already exists'))
    return 'already_registered';
  if (m.includes('email not confirmed') || m.includes('email_not_confirmed'))
    return 'email_not_confirmed';
  if (m.includes('rate') || m.includes('too many'))
    return 'rate_limited';
  if (
    m.includes('invalid login') ||
    m.includes('invalid credentials') ||
    m.includes('wrong password') ||
    m.includes('no user found')
  )
    return 'invalid_credentials';
  return 'unknown';
}

export async function signUp(
  email: string,
  password: string,
  is18: boolean,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/log-in`,
      data: { is_18_or_older: is18, display_name: email.split('@')[0] },
    },
  });
  if (!error) return { error: null };
  return { error: classifyError(error.message) };
}

export async function logIn(
  email: string,
  password: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) return { error: null };
  return { error: classifyError(error.message) };
}

export async function resendVerification(
  email: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (!error) return { error: null };
  return { error: error.message };
}

export async function requestPasswordReset(email: string): Promise<void> {
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/forgot-password`,
  });
}

export async function setNewPassword(
  password: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({ password });
  if (!error) return { error: null };
  return { error: classifyError(error.message) };
}

export async function logOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function deleteAccount(): Promise<{ error: string | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'Not logged in' };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const res = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    return { error: (body as { error?: string }).error ?? 'Unknown error' };
  }
  return { error: null };
}

export async function getProfile(): Promise<{
  displayName: string | null;
  email: string;
} | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('users')
    .select('display_name, email')
    .eq('id', user.id)
    .single();
  return {
    displayName: data?.display_name ?? (user.user_metadata?.display_name as string | undefined) ?? null,
    email: data?.email ?? user.email ?? '',
  };
}
