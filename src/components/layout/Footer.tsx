import { Link } from 'react-router-dom';
import { Mail, Globe, MessageCircle, Video, Send } from 'lucide-react';

const sections = [
  {
    title: 'Platform',
    links: [
      { label: 'Discover Events', href: '/discover' },
      { label: 'Create Event', href: '/organizer/events/create' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Enterprise', href: '/enterprise' },
    ],
  },
  {
    title: 'Event Types',
    links: [
      { label: 'Conferences', href: '/discover?type=conference' },
      { label: 'Concerts', href: '/discover?type=concert' },
      { label: 'Workshops', href: '/discover?type=workshop' },
      { label: 'Exhibitions', href: '/discover?type=exhibition' },
      { label: 'Corporate', href: '/discover?type=corporate' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

const socials = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: MessageCircle, href: '#', label: 'Twitter/X' },
  { icon: Send, href: '#', label: 'Telegram' },
  { icon: Video, href: '#', label: 'YouTube' },
  { icon: Mail, href: 'mailto:hello@avelora.com', label: 'Email' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900">
      {/* Top band */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-12">
        <div className="grid grid-cols-12 gap-10">

          {/* Brand column — 4 cols */}
          <div className="col-span-12 md:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-base">A</span>
              </div>
              <span className="font-serif text-xl text-white font-bold tracking-tight">Avelora</span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6 max-w-xs">
              The global event management platform for every occasion — from intimate workshops to stadium concerts.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-3">Stay in the loop</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-neutral-800 border border-neutral-700 text-white text-sm px-3.5 py-2 rounded-lg placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0">
                  Join
                </button>
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-500 transition-colors"
                >
                  <s.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns — 8 cols */}
          <div className="col-span-12 md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600">
            © {year} Avelora, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((label) => (
              <Link
                key={label}
                to={`/${label.toLowerCase().replace(/ /g, '-')}`}
                className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
          <a
            href="mailto:hello@avelora.com"
            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" /> hello@avelora.com
          </a>
        </div>
      </div>
    </footer>
  );
}
