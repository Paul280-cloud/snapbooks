import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TextField from '../components/TextField';
import Checkbox from '../components/Checkbox';
import Button from '../components/Button';
import { validatePassword } from '../lib/rules/password';
import { signUp } from '../lib/api/auth';
import { MSG } from '../lib/messages';

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [is18, setIs18] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const passwordValid = validatePassword(password);
  const passwordError =
    passwordTouched && !passwordValid ? MSG.passwordWeak : undefined;
  const canSubmit = email.length > 0 && passwordValid && is18 && agreedPrivacy;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setServerError(null);
    const { error } = await signUp(email, password, is18);
    setLoading(false);
    if (!error) {
      navigate('/log-in', { state: { fromSignUp: true } });
      return;
    }
    if (error === 'already_registered') {
      setServerError(MSG.alreadyRegistered);
    } else {
      setServerError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-[#111827]">Sign up</h1>
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
          onBlur={() => setPasswordTouched(true)}
          error={passwordError}
          autoComplete="new-password"
        />
        <Checkbox name="is18" checked={is18} onChange={setIs18}>
          I am 18 or older
        </Checkbox>
        <Checkbox
          name="agreedPrivacy"
          checked={agreedPrivacy}
          onChange={setAgreedPrivacy}
        >
          I agree to the{' '}
          <Link to="/privacy" className="text-[#1B7F4F] underline">
            Privacy Notice
          </Link>
        </Checkbox>
        {serverError && (
          <p className="text-sm text-[#DC2626]" role="alert">
            {serverError}{' '}
            {serverError === MSG.alreadyRegistered && (
              <Link to="/log-in" className="underline">
                Log in
              </Link>
            )}
          </p>
        )}
        <Button
          variant="primary"
          type="submit"
          loading={loading}
          disabled={!canSubmit}
        >
          Sign up
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[#6B7280]">
        Already have an account?{' '}
        <Link to="/log-in" className="text-[#1B7F4F] underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
