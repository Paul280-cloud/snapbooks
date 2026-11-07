import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { logIn, resendVerification } from '../lib/api/auth';
import { MSG } from '../lib/messages';

export default function LogIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromSignUp = location.state?.fromSignUp === true;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showResend, setShowResend] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowResend(false);
    setResendSuccess(false);
    const { error: authError } = await logIn(email, password);
    setLoading(false);
    if (!authError) {
      navigate('/receipts');
      return;
    }
    if (authError === 'email_not_confirmed') {
      setError(MSG.emailNotConfirmed);
      setShowResend(true);
    } else if (authError === 'rate_limited') {
      setError(MSG.rateLimited);
    } else if (authError === 'invalid_credentials') {
      setError(MSG.invalidCredentials);
    } else {
      setError('Something went wrong. Please try again.');
    }
  }

  async function handleResend() {
    setResendLoading(true);
    await resendVerification(email);
    setResendLoading(false);
    setResendSuccess(true);
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      {fromSignUp && (
        <div className="mb-4 rounded-[6px] bg-[#D1FAE5] p-3 text-sm text-[#065F46]">
          {MSG.fromSignUpBanner}
        </div>
      )}
      <h1 className="mb-6 text-2xl font-bold text-[#111827]">Log in</h1>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-[#1B7F4F] underline"
          >
            Forgot password?
          </Link>
        </div>
        {error && (
          <p className="text-sm text-[#DC2626]" role="alert">
            {error}
          </p>
        )}
        {showResend && !resendSuccess && (
          <Button
            variant="secondary"
            type="button"
            loading={resendLoading}
            onClick={handleResend}
          >
            Resend email
          </Button>
        )}
        {resendSuccess && (
          <p className="text-sm text-[#065F46]">{MSG.verificationSent}</p>
        )}
        <Button
          variant="primary"
          type="submit"
          loading={loading}
          disabled={loading}
        >
          Log in
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[#6B7280]">
        Don&apos;t have an account?{' '}
        <Link to="/sign-up" className="text-[#1B7F4F] underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
