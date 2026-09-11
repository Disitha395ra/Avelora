import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Ticket, Calendar } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn, getInitials } from '@/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { href: '/discover', label: 'Discover' },
    { href: '/organizer', label: 'Organizers' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white shadow-[0_1px_0_0_#e2e8f0] py-0'
          : 'bg-white/95 border-b border-neutral-100 py-0'
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* ── Logo ──────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/logo.png"
              alt="Avelora"
              className="h-9 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
              }}
            />
            <div className="hidden items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm tracking-tight">A</span>
              </div>
              <span className="text-[1.1rem] font-serif font-bold text-neutral-900 tracking-tight">
                Avelora
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────────── */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'nav-link text-sm font-medium transition-colors duration-150',
                    isActive ? 'text-brand-600 active' : 'text-neutral-600 hover:text-neutral-900'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Auth ──────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-brand-300 hover:bg-brand-50 transition-all duration-150"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                  </div>
                  <span className="text-sm font-medium text-neutral-700 max-w-[110px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-neutral-400 transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-neutral-100 mb-1">
                      <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">Signed in as</p>
                      <p className="text-sm font-medium text-neutral-900 truncate">{user.email}</p>
                    </div>
                    {(profile?.role === 'event_organizer' || profile?.role === 'platform_admin') && (
                      <MenuItem icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" href="/organizer/dashboard" />
                    )}
                    {profile?.role === 'platform_admin' && (
                      <MenuItem icon={<LayoutDashboard className="w-4 h-4" />} label="Admin Panel" href="/admin/dashboard" />
                    )}
                    <MenuItem icon={<Ticket className="w-4 h-4" />} label="My Tickets" href="/my/tickets" />
                    <MenuItem icon={<Calendar className="w-4 h-4" />} label="My Bookings" href="/my/bookings" />
                    <MenuItem icon={<User className="w-4 h-4" />} label="Profile" href="/my/profile" />
                    <div className="border-t border-neutral-100 mt-1.5 pt-1.5">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="text-sm font-medium text-neutral-600 hover:text-neutral-900 px-3 py-1.5 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="text-sm font-semibold bg-brand-600 text-white px-5 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile toggle ─────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white">
          <div className="px-5 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/my/bookings" className="block px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg">My Bookings</Link>
                  <button onClick={handleSignOut} className="text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <button className="w-full text-sm font-medium border border-neutral-200 text-neutral-700 px-4 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors">Sign In</button>
                  </Link>
                  <Link to="/register">
                    <button className="w-full text-sm font-semibold bg-brand-600 text-white px-4 py-2.5 rounded-lg hover:bg-brand-700 transition-colors">Get Started</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-brand-600 transition-colors"
    >
      <span className="text-neutral-400">{icon}</span>
      {label}
    </Link>
  );
}
