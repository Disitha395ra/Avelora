import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Calendar, MapPin, QrCode, RefreshCw, Ticket } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Link } from 'react-router-dom';

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchTickets = async () => {
      // Fetch bookings + their items to derive tickets
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id, booking_reference, status, created_at, total,
          event:events(id, title, slug, start_date, cover_image_url, currency,
            event_locations(city, country)),
          items:booking_items(
            id, quantity,
            ticket_type:ticket_types(name, price),
            seats:booking_seats(seat:seats(label, row_label, section:seating_sections(name)))
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      // Flatten into individual ticket entries
      const flatTickets: any[] = [];
      (bookingsData || []).forEach((booking) => {
        (booking.items || []).forEach((item: any) => {
          // If seats are assigned, one entry per seat; otherwise one per qty
          const seats = item.seats || [];
          if (seats.length > 0) {
            seats.forEach((bs: any, idx: number) => {
              flatTickets.push({
                id: `${item.id}-${idx}`,
                bookingRef: booking.booking_reference,
                bookingStatus: booking.status,
                event: booking.event,
                ticketType: item.ticket_type?.name || 'Ticket',
                price: item.ticket_type?.price,
                seat: bs.seat
                  ? `${bs.seat.section?.name || ''} · Row ${bs.seat.row_label || ''} Seat ${bs.seat.label || ''}`
                  : null,
              });
            });
          } else {
            for (let i = 0; i < (item.quantity || 1); i++) {
              flatTickets.push({
                id: `${item.id}-${i}`,
                bookingRef: booking.booking_reference,
                bookingStatus: booking.status,
                event: booking.event,
                ticketType: item.ticket_type?.name || 'Ticket',
                price: item.ticket_type?.price,
                seat: null,
              });
            }
          }
        });
      });

      setTickets(flatTickets);
      setLoading(false);
    };
    fetchTickets();
  }, [user]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">My Tickets</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{tickets.length} tickets</p>
          </div>
          <Ticket className="w-6 h-6 text-neutral-300" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading tickets…
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-neutral-700">No tickets yet</h2>
            <p className="text-sm text-neutral-400 mt-1 mb-6">
              Book an event to get your tickets here.
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
            {tickets.map((ticket) => {
              const event = ticket.event;
              const location = event?.event_locations?.[0];
              return (
                <div
                  key={ticket.id}
                  className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                >
                  {/* Ticket top */}
                  <div className="flex gap-4 p-5 border-b border-dashed border-neutral-200">
                    <img
                      src={
                        event?.cover_image_url ||
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&auto=format&fit=crop&q=80'
                      }
                      alt={event?.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-neutral-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-neutral-900 text-sm truncate">
                          {event?.title || 'Event'}
                        </h3>
                        <StatusBadge status={ticket.bookingStatus} />
                      </div>
                      <p className="text-xs text-brand-600 font-semibold mt-0.5">
                        {ticket.ticketType}
                        {ticket.price > 0 && (
                          <span className="text-neutral-400 font-normal ml-1">
                            · {event?.currency} {ticket.price}
                          </span>
                        )}
                      </p>
                      <div className="mt-2 space-y-1">
                        {event?.start_date && (
                          <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
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
                            <MapPin className="w-3 h-3" />
                            {[location.city, location.country].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                      {ticket.seat && (
                        <p className="mt-2 text-xs font-medium text-neutral-700 bg-neutral-100 px-2 py-1 rounded-md inline-block">
                          🪑 {ticket.seat}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ticket bottom — QR area */}
                  <div className="flex items-center justify-between px-5 py-4 bg-neutral-50">
                    <div>
                      <p className="text-xs text-neutral-400 mb-0.5">Booking Reference</p>
                      <p className="text-xs font-mono font-bold text-neutral-800">
                        {ticket.bookingRef}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/event/${event?.slug}`}
                        className="text-xs text-brand-600 hover:underline font-medium"
                      >
                        View Event
                      </Link>
                      <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors">
                        <QrCode className="w-7 h-7 text-white" />
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
