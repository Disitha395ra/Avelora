import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Ticket, Calendar } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn, getInitials } from '@/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
    { href: '/discover', label: 'Discover Events' },
    { href: '/organizer', label: 'Organize' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-sm border-b border-neutral-200 shadow-sm'
          : 'bg-white border-b border-neutral-100'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-bold text-neutral-900 tracking-tight">
              Avelora
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                  location.pathname === link.href
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-150"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">
                    {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                  </div>
                  <span className="text-sm font-medium text-neutral-700 max-w-[120px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-neutral-400 transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                      <p className="text-xs text-neutral-500">Signed in as</p>
                      <p className="text-sm font-medium text-neutral-900 truncate">{user.email}</p>
                    </div>

                    {profile?.role === 'event_organizer' || profile?.role === 'platform_admin' ? (
                      <UserMenuItem icon={<LayoutDashboard className="w-4 h-4" />} label="Organizer Dashboard" href="/organizer/dashboard" />
                    ) : null}
                    {profile?.role === 'platform_admin' && (
                      <UserMenuItem icon={<LayoutDashboard className="w-4 h-4" />} label="Admin Dashboard" href="/admin/dashboard" />
                    )}
                    <UserMenuItem icon={<Ticket className="w-4 h-4" />} label="My Tickets" href="/my/tickets" />
                    <UserMenuItem icon={<Calendar className="w-4 h-4" />} label="My Bookings" href="/my/bookings" />
                    <UserMenuItem icon={<User className="w-4 h-4" />} label="Profile" href="/my/profile" />
                    <div className="border-t border-neutral-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-1 transition-colors"
                        style={{ width: 'calc(100% - 8px)' }}
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
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/my/bookings" className="block px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50">My Bookings</Link>
                  <button onClick={handleSignOut} className="text-left px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"><Button variant="outline" fullWidth>Sign In</Button></Link>
                  <Link to="/register"><Button variant="primary" fullWidth>Get Started</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function UserMenuItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg mx-1 transition-colors"
      style={{ width: 'calc(100% - 8px)' }}
    >
      <span className="text-neutral-400">{icon}</span>
      {label}
    </Link>
  );
}
