import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/AuthContext';
import { StatusBadge } from '@/components/ui/Badge';

// Mock BOOKINGS removed

export default function OrganizerBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      // Fetch events first
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title')
        .eq('organizer_id', user.id);
        
      if (eventsData && eventsData.length > 0) {
        const eventMap = eventsData.reduce((acc, e) => ({...acc, [e.id]: e}), {});
        setEvents(eventMap);
        const eventIds = eventsData.map(e => e.id);
        
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*, booking_items(quantity, ticket_types(name))')
          .in('event_id', eventIds)
          .order('created_at', { ascending: false });
          
        if (bookingsData) {
          setBookings(bookingsData);
        }
      }
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  const totalBookingsCount = bookings.length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledBookingsCount = bookings.filter(b => b.status === 'cancelled').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total || 0), 0);
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Bookings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">All bookings across your events</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Bookings', value: totalBookingsCount.toString() },
          { label: 'Confirmed', value: confirmedBookingsCount.toString() },
          { label: 'Cancelled', value: cancelledBookingsCount.toString() },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {['Reference', 'Attendee', 'Event', 'Ticket', 'Qty', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-neutral-500">Loading bookings...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-neutral-500">No bookings found</td></tr>
              ) : bookings.map(b => {
                const eventTitle = events[b.event_id]?.title || 'Unknown Event';
                const tickets = b.booking_items?.map((bi: any) => bi.ticket_types?.name).join(', ') || 'Ticket';
                const totalQty = b.booking_items?.reduce((sum: number, bi: any) => sum + bi.quantity, 0) || 1;
                return (
                <tr key={b.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-neutral-500 whitespace-nowrap">{b.booking_reference}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-neutral-900">Attendee</p>
                    <p className="text-xs text-neutral-400">Customer {b.customer_id.substring(0,8)}...</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 max-w-[150px] truncate">{eventTitle}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{tickets}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{totalQty}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-neutral-900">${b.total}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
