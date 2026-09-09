import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, CreditCard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/events', icon: Calendar, label: 'Events' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function AdminLayout() {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <aside className="w-56 bg-neutral-900 text-white flex flex-col fixed h-full">
        <div className="p-5 border-b border-neutral-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="text-sm font-bold">Avelora Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-3">
          {NAV.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                location.pathname === item.href ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-neutral-800">
          <button onClick={async () => { await signOut(); navigate('/'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/5 w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-56 p-8">
        <Outlet />
      </main>
    </div>
  );
}
