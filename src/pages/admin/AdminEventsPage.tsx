import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import {
  Search, Eye, RefreshCw, Calendar, DollarSign, CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['all', 'draft', 'published', 'paused', 'cancelled', 'completed'];

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: eventsData } = await supabase
        .from('events')
        .select('*, organizer:profiles(full_name, email), event_locations(city, country), ticket_types(quantity, quantity_sold)')
        .order('created_at', { ascending: false });

      if (eventsData) {
        setEvents(eventsData);
        const eventIds = eventsData.map((e: any) => e.id);
        if (eventIds.length > 0) {
          const { data: bookingsData } = await supabase
            .from('bookings')
            .select('event_id, total, status')
            .in('event_id', eventIds)
            .in('status', ['confirmed', 'pending']);
          setBookings(bookingsData || []);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const updateStatus = async (eventId: string, newStatus: string) => {
    const { error } = await supabase
      .from('events')
      .update({ status: newStatus })
      .eq('id', eventId);
    if (error) {
      toast.error('Failed to update event status');
    } else {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e)),
      );
      toast.success('Event status updated');
    }
  };

  const filtered = events.filter((e) => {
    const matchSearch =
      !search ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary stats
  const totalRevenue = bookings.reduce((s, b) => s + (b.total || 0), 0);
  const platformFee = totalRevenue * 0.03;
  const publishedCount = events.filter((e) => e.status === 'published').length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">All Events</h1>
        <p className="text-sm text-neutral-500 mt-0.5">View and manage every event on the platform.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Total Events',
            value: events.length,
            icon: <Calendar className="w-4 h-4 text-brand-500" />,
            color: 'bg-brand-50',
          },
          {
            label: 'Published',
            value: publishedCount,
            icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
            color: 'bg-green-50',
          },
          {
            label: 'Platform Revenue',
            value: `$${platformFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            icon: <DollarSign className="w-4 h-4 text-violet-500" />,
            color: 'bg-violet-50',
          },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-neutral-500">{s.label}</p>
              <p className="text-lg font-bold text-neutral-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search events or organizer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {['Event', 'Organizer', 'Location', 'Date', 'Sales', 'Revenue', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center">
                    <RefreshCw className="w-5 h-5 animate-spin text-neutral-300 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-neutral-400">
                    No events found
                  </td>
                </tr>
              ) : (
                filtered.map((event: any) => {
                  const eventBookings = bookings.filter((b) => b.event_id === event.id);
                  const revenue = eventBookings.reduce((s, b) => s + (b.total || 0), 0);
                  const sold = event.ticket_types?.reduce(
                    (s: number, t: any) => s + (t.quantity_sold || 0), 0,
                  ) || 0;
                  const total = event.ticket_types?.reduce(
                    (s: number, t: any) => s + (t.quantity || 0), 0,
                  ) || 0;
                  const loc = event.event_locations?.[0];

                  return (
                    <tr key={event.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-neutral-900 max-w-[180px] truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-neutral-400 capitalize mt-0.5">
                          {event.event_type?.replace(/_/g, ' ')}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {event.organizer?.full_name || event.organizer?.email || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-500">
                        {loc ? `${loc.city || ''}, ${loc.country || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '') : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                        {new Date(event.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {sold}/{total || '∞'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-neutral-900">
                        ${revenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/event/${event.slug}`}
                            target="_blank"
                            className="p-1.5 text-neutral-400 hover:text-brand-600 rounded-md hover:bg-brand-50 transition-colors"
                            title="View public page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <select
                            value={event.status}
                            onChange={(e) => updateStatus(event.id, e.target.value)}
                            className="text-xs border border-neutral-200 rounded-lg px-2 py-1 bg-white text-neutral-700 hover:border-neutral-300"
                          >
                            {['draft', 'published', 'paused', 'cancelled', 'completed'].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 text-xs text-neutral-400">
            Showing {filtered.length} of {events.length} events
          </div>
        )}
      </div>
    </div>
  );
}
