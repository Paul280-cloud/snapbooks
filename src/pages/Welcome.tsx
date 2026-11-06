import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Camera
            data-testid="camera-icon"
            size={28}
            className="text-[#1B7F4F]"
            aria-hidden="true"
          />
          <span className="text-[24px] font-bold text-[#1B7F4F]">SnapBooks</span>
        </div>

        <h1 className="mb-3 text-[24px] font-bold text-[#111827]">
          Snap receipts. Survive tax season.
        </h1>

        <p className="mb-8 text-base text-[#111827]">
          The easiest way to file receipts and prepare for tax season — no bookkeeping
          knowledge needed.
        </p>

        <Link
          to="/sign-up"
          className="mb-3 flex h-[48px] w-full items-center justify-center rounded-[6px] bg-[#1B7F4F] text-base font-semibold text-white hover:bg-[#166B41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7F4F] focus-visible:ring-offset-2"
        >
          Create account
        </Link>

        <p className="text-base text-[#6B7280]">
          Already have an account?{' '}
          <Link
            to="/log-in"
            className="font-semibold text-[#1B7F4F] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7F4F]"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
