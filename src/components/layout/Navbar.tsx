import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Ticket, Calendar } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn, getInitials } from '@/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 24); window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll); }, []);
  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location]);
  const handleSignOut = async () => { await signOut(); navigate('/'); };
  const navLinks = [{ href: '/discover', label: 'Find an event' }, { href: '/organizer', label: 'For organisers' }, { href: '/pricing', label: 'Pricing' }];
  return (
    <header className={cn('fixed top-0 left-0 right-0 z-40 transition-all duration-300', scrolled ? 'bg-[#f7f6f2]/95 backdrop-blur-md border-b border-neutral-200' : 'bg-[#f7f6f2] border-b border-neutral-200')}>
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8"><div className="h-[76px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Avelora home"><span className="w-9 h-9 rounded-full border border-neutral-900 flex items-center justify-center font-serif text-xl italic">a</span><span className="font-serif text-[1.55rem] text-neutral-900 tracking-tight">avelora</span></Link>
        <nav className="hidden md:flex items-center gap-9 ml-12 mr-auto"><span className="font-mono text-[10px] tracking-[.18em] uppercase text-neutral-400">Est. 2024</span>{navLinks.map((link) => <Link key={link.href} to={link.href} className={cn('nav-link text-[13px] font-semibold tracking-wide', location.pathname.startsWith(link.href) ? 'text-accent-500 active' : 'text-neutral-600 hover:text-neutral-900')}>{link.label}</Link>)}</nav>
        <div className="hidden md:flex items-center gap-4">{user ? <div className="relative"><button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 text-sm font-semibold"><span className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center text-brand-800 text-xs">{profile?.full_name ? getInitials(profile.full_name) : 'U'}</span><ChevronDown className="w-3.5 h-3.5 text-neutral-400" /></button>{userMenuOpen && <div className="absolute right-0 top-12 w-56 bg-[#f7f6f2] border border-neutral-200 shadow-xl py-2 z-50"><div className="px-4 py-3 border-b border-neutral-200"><p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">Signed in as</p><p className="text-sm truncate mt-1">{user.email}</p></div>{(profile?.role === 'event_organizer' || profile?.role === 'platform_admin') && <MenuItem icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" href="/organizer/dashboard" />}<MenuItem icon={<Ticket className="w-4 h-4" />} label="My Tickets" href="/my/tickets" /><MenuItem icon={<Calendar className="w-4 h-4" />} label="My Bookings" href="/my/bookings" /><button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-accent-600 hover:bg-neutral-100"><LogOut className="w-4 h-4" />Sign out</button></div>}</div> : <><Link to="/login" className="text-[13px] font-semibold text-neutral-600 hover:text-neutral-900">Sign in</Link><Link to="/register" className="bg-neutral-900 text-white text-[13px] font-semibold px-5 py-3 rounded-full hover:bg-accent-500 transition-colors">Host an event</Link></>}</div>
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div></div>
      {menuOpen && <div className="md:hidden border-t border-neutral-200 bg-[#f7f6f2] px-5 py-5 space-y-3">{navLinks.map((link) => <Link key={link.href} to={link.href} className="block py-2 text-sm font-semibold">{link.label}</Link>)}<div className="pt-3 border-t border-neutral-200">{user ? <button onClick={handleSignOut} className="text-sm text-accent-600">Sign out</button> : <Link to="/login" className="text-sm font-semibold">Sign in</Link>}</div></div>}
    </header>
  );
}
function MenuItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) { return <Link to={href} className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"><span className="text-neutral-400">{icon}</span>{label}</Link>; }
