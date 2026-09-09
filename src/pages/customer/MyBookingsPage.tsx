import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StatusBadge } from '@/components/ui/Badge';
import { Calendar, MapPin, Download, QrCode } from 'lucide-react';

const BOOKINGS = [
  { ref: 'AVL-2026-001847', event: 'FutureTech Summit 2026', date: 'Mar 12–14, 2026', venue: 'Moscone Center, SF', ticket: 'Professional × 2', total: '$798', status: 'confirmed', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&auto=format&fit=crop&q=80' },
  { ref: 'AVL-2026-000982', event: 'Startup Masterclass Series', date: 'Feb 18, 2026', venue: 'WeWork, Toronto', ticket: 'Standard × 1', total: 'CAD $89', status: 'confirmed', image: 'https://images.unsplash.com/photo-1558403194-611308249627?w=80&auto=format&fit=crop&q=80' },
];

export default function MyBookingsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16 max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Bookings</h1>
        <div className="space-y-4">
          {BOOKINGS.map(b => (
            <div key={b.ref} className="bg-white border border-neutral-200 rounded-xl p-5 flex gap-4">
              <img src={b.image} alt={b.event} className="w-20 h-20 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-neutral-900">{b.event}</h3>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-neutral-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{b.date}</p>
                  <p className="text-xs text-neutral-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{b.venue}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400">{b.ticket}</p>
                    <p className="text-sm font-bold text-neutral-900">{b.total}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Invoice
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                      <QrCode className="w-3.5 h-3.5" /> Tickets
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs font-mono text-neutral-400">{b.ref}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
