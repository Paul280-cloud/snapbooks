import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { requestPasswordReset, setNewPassword } from '../lib/api/auth';
import { validatePassword } from '../lib/rules/password';
import { MSG } from '../lib/messages';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'request' | 'set-new'>('request');

  // request mode
  const [email, setEmail] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [sent, setSent] = useState(false);

  // set-new mode
  const [newPassword, setNewPassword_] = useState('');
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setMode('set-new');
        }
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setRequesting(true);
    await requestPasswordReset(email);
    setRequesting(false);
    setSent(true);
  }

  async function handleSetNew(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    const { error } = await setNewPassword(newPassword);
    setSaving(false);
    if (!error) {
      navigate('/receipts');
    } else {
      setSaveError('Something went wrong. Please try again.');
    }
  }

  const newPasswordValid = validatePassword(newPassword);
  const newPasswordError =
    newPasswordTouched && !newPasswordValid ? MSG.passwordWeak : undefined;

  if (mode === 'set-new') {
    return (
      <div className="mx-auto max-w-sm px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold text-[#111827]">
          Set new password
        </h1>
        <form onSubmit={handleSetNew} noValidate className="flex flex-col gap-4">
          <TextField
            label="New password"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword_(e.target.value)}
            onBlur={() => setNewPasswordTouched(true)}
            error={newPasswordError}
            autoComplete="new-password"
          />
          {saveError && (
            <p className="text-sm text-[#DC2626]" role="alert">
              {saveError}
            </p>
          )}
          <Button
            variant="primary"
            type="submit"
            loading={saving}
            disabled={!newPasswordValid}
          >
            Save password
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <Link
        to="/log-in"
        aria-label="Go back"
        className="mb-4 inline-flex items-center text-sm text-[#1B7F4F]"
      >
        ← Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-[#111827]">
        Forgot password
      </h1>
      {sent ? (
        <p className="text-sm text-[#065F46]">{MSG.resetLinkSent}</p>
      ) : (
        <form onSubmit={handleRequest} noValidate className="flex flex-col gap-4">
          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Button
            variant="primary"
            type="submit"
            loading={requesting}
            disabled={email.length === 0}
          >
            Send link
          </Button>
        </form>
      )}
    </div>
  );
}
