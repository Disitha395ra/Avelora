import { Link } from 'react-router-dom';
import { Globe, Mail } from 'lucide-react';


export function Footer() {
  const currentYear = new Date().getFullYear();

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
        { label: 'Corporate Events', href: '/discover?type=corporate' },
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

  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Top */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-neutral-800">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-lg font-bold text-white">Avelora</span>
            </Link>
            <p className="text-sm leading-relaxed text-neutral-500 mb-6">
              Where Experiences Come Together. The global event management platform for every occasion.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-neutral-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-600">
            © {currentYear} Avelora, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <Mail className="w-3.5 h-3.5" />
            <a href="mailto:hello@avelora.com" className="hover:text-neutral-400 transition-colors">
              hello@avelora.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
