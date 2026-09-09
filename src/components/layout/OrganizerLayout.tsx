import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Plus, BookOpen, Users, CreditCard,
  BarChart3, Settings, Menu, X, ChevronRight, LogOut, Ticket,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn, getInitials } from '@/utils';

const NAV_ITEMS = [
  { href: '/organizer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/organizer/events', icon: Calendar, label: 'My Events' },
  { href: '/organizer/events/create', icon: Plus, label: 'Create Event', highlight: true },
  { href: '/organizer/bookings', icon: BookOpen, label: 'Bookings' },
  { href: '/organizer/attendees', icon: Users, label: 'Attendees' },
  { href: '/organizer/tickets', icon: Ticket, label: 'Tickets' },
  { href: '/organizer/payments', icon: CreditCard, label: 'Payments' },
  { href: '/organizer/reports', icon: BarChart3, label: 'Reports' },
  { href: '/organizer/staff', icon: UserCheck, label: 'Staff' },
  { href: '/organizer/settings', icon: Settings, label: 'Settings' },
];

export function OrganizerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-neutral-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-base font-bold text-neutral-900">Avelora</span>
        </Link>
        <span className="ml-auto text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full font-medium">
          Organizer
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/organizer/dashboard' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  item.highlight && !isActive
                    ? 'bg-brand-500 text-white hover:bg-brand-600'
                    : isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {item.highlight && !isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-neutral-100">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs shrink-0">
            {profile?.full_name ? getInitials(profile.full_name) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">{profile?.full_name || 'Organizer'}</p>
            <p className="text-xs text-neutral-500 truncate">{profile?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <Link
          to="/"
          className="mt-2 flex items-center justify-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          ← Back to main site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 bg-white border-r border-neutral-200 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white h-full shadow-xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-neutral-200 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-neutral-900">Avelora Organizer</span>
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
            {profile?.full_name ? getInitials(profile.full_name) : 'U'}
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
