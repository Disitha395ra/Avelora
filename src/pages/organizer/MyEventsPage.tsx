import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Share2, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { SITE_URL } from '@/utils';

// Mock EVENTS removed

export default function MyEventsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: eventsData } = await supabase
        .from('events')
        .select('*, ticket_types(quantity, quantity_sold)')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });
        
      if (eventsData) {
        setEvents(eventsData);
        const eventIds = eventsData.map((e: any) => e.id);
        
        if (eventIds.length > 0) {
          const { data: bookingsData } = await supabase
            .from('bookings')
            .select('*')
            .in('event_id', eventIds);
          if (bookingsData) setBookings(bookingsData);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const filtered = events.filter((e: any) => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Events</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{events.length} events</p>
        </div>
        <Link to="/organizer/events/create">
          <Button icon={<Plus className="w-4 h-4" />}>Create Event</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              {['Event', 'Type', 'Date', 'Status', 'Sales', 'Revenue', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">Loading events...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">No events found</td></tr>
            ) : filtered.map((event: any) => {
              const eventBookings = bookings.filter((b: any) => b.event_id === event.id);
              const sold = event.ticket_types?.reduce((sum: number, t: any) => sum + (t.quantity_sold || 0), 0) || 0;
              const revenue = eventBookings.reduce((sum: number, b: any) => sum + (b.total || 0), 0);
              const pct = event.max_capacity ? Math.round((sold / event.max_capacity) * 100) : 0;
              return (
                <tr key={event.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&auto=format&fit=crop&q=80'} alt={event.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <span className="text-sm font-medium text-neutral-900">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500 capitalize">{event.event_type}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{new Date(event.start_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={event.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-neutral-100 rounded-full">
                        <div className="h-1.5 bg-brand-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className="text-xs text-neutral-500">{sold}/{event.max_capacity || '∞'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-neutral-900">${revenue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/organizer/events/${event.id}`} title="Manage Event" className="p-1.5 text-neutral-400 hover:text-brand-600 rounded-md hover:bg-brand-50"><Edit className="w-4 h-4" /></Link>
                      <Link to={`/event/${event.slug}`} target="_blank" title="View Public Page" className="p-1.5 text-neutral-400 hover:text-brand-600 rounded-md hover:bg-brand-50"><Eye className="w-4 h-4" /></Link>
                      <button
                        title="Copy Share Link"
                        onClick={() => {
                          navigator.clipboard.writeText(`${SITE_URL}/event/${event.slug}`);
                          toast.success('Event link copied!');
                        }}
                        className="p-1.5 text-neutral-400 hover:text-brand-600 rounded-md hover:bg-brand-50"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
