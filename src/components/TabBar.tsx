import { NavLink } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

export default function TabBar() {
  const { session } = useSession();
  if (!session) return null;

  const active = 'text-[#1B7F4F] font-semibold';
  const inactive = 'text-[#6B7280]';

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-gray-200 bg-white py-2">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? active : inactive}`}
      >
        Home
      </NavLink>
      <NavLink
        to="/receipts"
        className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? active : inactive}`}
      >
        Receipts
      </NavLink>
    </nav>
  );
}
