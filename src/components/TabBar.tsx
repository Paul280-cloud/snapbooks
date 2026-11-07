import { NavLink } from 'react-router-dom';
import { Receipt, FileSpreadsheet, BarChart2, User } from 'lucide-react';
import { useSession } from '../hooks/useSession';

export default function TabBar() {
  const { session } = useSession();
  if (!session) return null;

  const active = 'text-[#1B7F4F]';
  const inactive = 'text-[#6B7280]';

  const tabs = [
    { to: '/receipts', label: 'Receipts', Icon: Receipt },
    { to: '/export', label: 'Export', Icon: FileSpreadsheet },
    { to: '/dashboard', label: 'Dashboard', Icon: BarChart2 },
    { to: '/profile', label: 'Profile', Icon: User },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-gray-200 bg-white py-2"
    >
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-xs ${isActive ? active : inactive}`
          }
        >
          <Icon size={20} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
