import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Calendar, MapPin, QrCode } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';

const TICKETS = [
  {
    code: 'TKT-FT26-001847A', event: 'FutureTech Summit 2026', type: 'Professional',
    date: 'Mar 12, 2026', venue: 'Moscone Center, San Francisco', seat: 'No assigned seat',
    attendee: 'Sarah Mitchell', status: 'valid',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&auto=format&fit=crop&q=80',
  },
  {
    code: 'TKT-FT26-001847B', event: 'FutureTech Summit 2026', type: 'Professional',
    date: 'Mar 12, 2026', venue: 'Moscone Center, San Francisco', seat: 'No assigned seat',
    attendee: 'Marcus Chen', status: 'valid',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&auto=format&fit=crop&q=80',
  },
];

export default function MyTicketsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Tickets</h1>
        <div className="space-y-4">
          {TICKETS.map(ticket => (
            <div key={ticket.code} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              {/* Ticket top */}
              <div className="flex gap-4 p-5 border-b border-dashed border-neutral-200">
                <img src={ticket.image} alt={ticket.event} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-neutral-900 text-sm">{ticket.event}</h3>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="text-xs text-brand-600 font-medium mt-0.5">{ticket.type}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-neutral-500 flex items-center gap-1.5"><Calendar className="w-3 h-3" />{ticket.date}</p>
                    <p className="text-xs text-neutral-500 flex items-center gap-1.5"><MapPin className="w-3 h-3" />{ticket.venue}</p>
                  </div>
                  <p className="text-xs text-neutral-700 font-medium mt-2">{ticket.attendee}</p>
                </div>
              </div>

              {/* Ticket bottom */}
              <div className="flex items-center justify-between px-5 py-4 bg-neutral-50">
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Ticket Code</p>
                  <p className="text-xs font-mono font-bold text-neutral-800">{ticket.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center">
                    <QrCode className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
