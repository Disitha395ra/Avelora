import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, CreditCard, Settings, LogOut, Shield,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/utils';

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/events', icon: Calendar, label: 'Events' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function AdminLayout() {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <aside className="w-60 bg-neutral-900 text-white flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="p-5 border-b border-neutral-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <span className="text-sm font-bold block leading-none">Avelora</span>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                <Shield className="w-2.5 h-2.5" /> Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5',
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Sign out */}
        <div className="p-3 border-t border-neutral-800 space-y-1">
          {profile && (
            <div className="px-3 py-2 rounded-lg bg-white/5 mb-2">
              <p className="text-xs font-medium text-white truncate">
                {profile.full_name || 'Admin'}
              </p>
              <p className="text-[10px] text-neutral-400 truncate">{profile.email}</p>
            </div>
          )}
          <button
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/5 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
