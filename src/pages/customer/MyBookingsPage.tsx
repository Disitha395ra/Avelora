import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Calendar, MapPin, Download, QrCode, RefreshCw, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          event:events(id, title, slug, start_date, cover_image_url, currency,
            event_locations(city, country)),
          items:booking_items(quantity, unit_price, ticket_type:ticket_types(name))
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      setBookings(data || []);
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16 max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">My Bookings</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{bookings.length} bookings found</p>
          </div>
          <Ticket className="w-6 h-6 text-neutral-300" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading bookings…
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-neutral-700">No bookings yet</h2>
            <p className="text-sm text-neutral-400 mt-1 mb-6">
              Discover events and book your first ticket.
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const event = b.event;
              const location = event?.event_locations?.[0];
              // Build ticket summary string
              const ticketSummary = (b.items || [])
                .map((item: any) => `${item.ticket_type?.name} × ${item.quantity}`)
                .join(', ');

              return (
                <div
                  key={b.id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 flex gap-4 hover:border-neutral-300 hover:shadow-sm transition-all"
                >
                  <img
                    src={
                      event?.cover_image_url ||
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&auto=format&fit=crop&q=80'
                    }
                    alt={event?.title}
                    className="w-20 h-20 rounded-lg object-cover shrink-0 border border-neutral-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          {event?.title || 'Event'}
                        </h3>
                        <p className="text-xs font-mono text-neutral-400 mt-0.5">
                          {b.booking_reference}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="mt-2 space-y-1">
                      {event?.start_date && (
                        <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(event.start_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                      {location && (
                        <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {[location.city, location.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-xs text-neutral-400">{ticketSummary || 'Tickets'}</p>
                        <p className="text-sm font-bold text-neutral-900 mt-0.5">
                          {event?.currency || 'USD'} {(b.total || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toast('Invoice download coming soon!', { icon: '📄' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Invoice
                        </button>
                        <Link
                          to="/my/tickets"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Tickets
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
