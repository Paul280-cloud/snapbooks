import { Link } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

export default function Header() {
  const { session } = useSession();

  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.svg" alt="SnapBooks" className="h-7 w-7" />
        <span className="font-bold text-[#111827]">SnapBooks</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {session ? (
          <Link to="/profile" className="text-[#1B7F4F] hover:underline">
            Profile
          </Link>
        ) : (
          <>
            <Link to="/log-in" className="text-[#1B7F4F] hover:underline">
              Log in
            </Link>
            <Link
              to="/sign-up"
              className="rounded-[6px] bg-[#1B7F4F] px-3 py-1.5 text-white hover:bg-[#166B41]"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
