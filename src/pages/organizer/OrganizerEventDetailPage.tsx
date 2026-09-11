import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { SITE_URL } from '@/utils';
import {
  Calendar, Users, DollarSign, TrendingUp, Copy, ExternalLink,
  ArrowLeft, BarChart3, Ticket, Share2, CheckCircle2, Clock,
  MapPin, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { cn } from '@/utils';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'attendees' | 'tickets' | 'share';

export default function OrganizerEventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      setLoading(true);

      const { data: eventData } = await supabase
        .from('events')
        .select('*, event_locations(*), ticket_types(*)')
        .eq('id', id)
        .single();

      if (eventData) {
        setEvent(eventData);
        setTicketTypes(eventData.ticket_types || []);

        // Fetch bookings for this event with customer info
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(
            '*, customer:profiles(full_name, email), items:booking_items(*, ticket_type:ticket_types(name, price))',
          )
          .eq('event_id', id)
          .order('created_at', { ascending: false });

        setBookings(bookingsData || []);
      }

      setLoading(false);
    };
    fetchAll();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        Loading event…
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Event not found.</p>
        <Link to="/organizer/events" className="text-brand-600 text-sm mt-2 inline-block">
          ← Back to events
        </Link>
      </div>
    );
  }

  // --- Computed Stats ---
  const confirmedBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending',
  );
  const totalRevenue = confirmedBookings.reduce((s, b) => s + (b.total || 0), 0);
  const totalSold = ticketTypes.reduce((s: number, t: any) => s + (t.quantity_sold || 0), 0);
  const totalCapacity = ticketTypes.reduce((s: number, t: any) => s + (t.quantity || 0), 0);
  const soldPct = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

  const eventUrl = `${SITE_URL}/event/${event.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    toast.success('Event link copied!');
  };

  const location = event.event_locations?.[0] || event.event_locations || {};

  const TABS: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'attendees', label: `Attendees (${confirmedBookings.length})`, icon: Users },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'share', label: 'Share', icon: Share2 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back nav */}
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Events
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <img
            src={
              event.cover_image_url ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&auto=format&fit=crop&q=80'
            }
            alt={event.title}
            className="w-16 h-16 rounded-xl object-cover border border-neutral-100 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-neutral-900">{event.title}</h1>
              <StatusBadge status={event.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(event.start_date).toLocaleDateString()}
              </span>
              {location.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {location.city}, {location.country}
                </span>
              )}
              <span className="flex items-center gap-1 capitalize">
                <Clock className="w-3.5 h-3.5" />
                {event.event_type?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={copyLink} icon={<Copy className="w-4 h-4" />}>
            Copy Link
          </Button>
          <a href={eventUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
              View Page
            </Button>
          </a>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Tickets Sold',
            value: `${totalSold} / ${totalCapacity || '∞'}`,
            sub: `${soldPct}% sold`,
            icon: <Ticket className="w-4 h-4 text-brand-500" />,
            color: 'bg-brand-50',
          },
          {
            label: 'Total Revenue',
            value: `${event.currency} ${totalRevenue.toLocaleString()}`,
            sub: 'Confirmed bookings',
            icon: <DollarSign className="w-4 h-4 text-green-500" />,
            color: 'bg-green-50',
          },
          {
            label: 'Bookings',
            value: confirmedBookings.length,
            sub: `${bookings.length} total incl. cancelled`,
            icon: <Users className="w-4 h-4 text-blue-500" />,
            color: 'bg-blue-50',
          },
          {
            label: 'Occupancy',
            value: `${soldPct}%`,
            sub: 'Of total capacity',
            icon: <TrendingUp className="w-4 h-4 text-violet-500" />,
            color: 'bg-violet-50',
          },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-neutral-500">{s.label}</p>
              <div className={`p-1.5 rounded-lg ${s.color}`}>{s.icon}</div>
            </div>
            <p className="text-xl font-bold text-neutral-900">{s.value}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Capacity Bar */}
      {totalCapacity > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-neutral-700">Ticket Sales Progress</span>
            <span className="text-neutral-500">
              {totalSold} of {totalCapacity} sold ({soldPct}%)
            </span>
          </div>
          <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-3 bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(soldPct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700',
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Ticket type breakdown */}
          <div className="bg-white border border-neutral-200 rounded-xl">
            <div className="p-5 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900">Ticket Types</h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {ticketTypes.length === 0 ? (
                <p className="px-5 py-6 text-sm text-neutral-400">No ticket types defined.</p>
              ) : (
                ticketTypes.map((tt: any) => {
                  const sold = tt.quantity_sold || 0;
                  const pct = tt.quantity > 0 ? Math.round((sold / tt.quantity) * 100) : 0;
                  return (
                    <div key={tt.id} className="px-5 py-4 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{tt.name}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {event.currency} {tt.price} each
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-28 h-1.5 bg-neutral-100 rounded-full">
                          <div
                            className="h-1.5 bg-brand-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500 w-20 text-right">
                          {sold}/{tt.quantity} sold
                        </span>
                        <span className="text-sm font-semibold text-neutral-900 w-28 text-right">
                          {event.currency} {(sold * tt.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Attendees */}
      {activeTab === 'attendees' && (
        <div className="bg-white border border-neutral-200 rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  {['Reference', 'Customer', 'Email', 'Amount', 'Status', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-neutral-400">
                      No bookings yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 text-xs font-mono text-neutral-500">
                        {b.booking_reference}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-neutral-900">
                        {b.customer?.full_name || '—'}
                      </td>
                      <td className="px-5 py-3 text-sm text-neutral-500">
                        {b.customer?.email || '—'}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-neutral-900">
                        {event.currency} {(b.total || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-3 text-xs text-neutral-400">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {ticketTypes.map((tt: any) => {
            const sold = tt.quantity_sold || 0;
            const available = tt.quantity - sold;
            return (
              <div key={tt.id} className="bg-white border border-neutral-200 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{tt.name}</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">{tt.description}</p>
                  </div>
                  <p className="text-xl font-bold text-neutral-900">
                    {event.currency} {tt.price}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xl font-bold text-neutral-900">{tt.quantity}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Total</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-700">{sold}</p>
                    <p className="text-xs text-green-600 mt-0.5">Sold</p>
                  </div>
                  <div className="text-center p-3 bg-brand-50 rounded-lg">
                    <p className="text-xl font-bold text-brand-700">{available}</p>
                    <p className="text-xs text-brand-600 mt-0.5">Available</p>
                  </div>
                </div>
                {tt.sale_start || tt.sale_end ? (
                  <p className="mt-3 text-xs text-neutral-400">
                    Sales:{' '}
                    {tt.sale_start
                      ? new Date(tt.sale_start).toLocaleDateString()
                      : 'Now'}{' '}
                    →{' '}
                    {tt.sale_end ? new Date(tt.sale_end).toLocaleDateString() : 'No end date'}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Share */}
      {activeTab === 'share' && (
        <div className="max-w-xl space-y-6">
          {/* Event URL */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h3 className="font-semibold text-neutral-900 mb-1">Shareable Event Link</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Share this link with your audience so they can view the event and buy tickets.
            </p>
            <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="flex-1 text-sm font-mono text-neutral-700 truncate">
                {eventUrl}
              </span>
              <button
                onClick={copyLink}
                className="p-2 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={eventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Sharing Checklist</h3>
            <div className="space-y-3">
              {[
                {
                  label: 'Event is published',
                  done: event.status === 'published',
                  hint: 'Must be published for customers to access',
                },
                {
                  label: 'Cover image set',
                  done: !!event.cover_image_url,
                  hint: 'A cover image makes the event more attractive',
                },
                {
                  label: 'Ticket types defined',
                  done: ticketTypes.length > 0,
                  hint: 'Customers need at least one ticket type to book',
                },
                {
                  label: 'Contact email set',
                  done: !!event.contact_email,
                  hint: 'Customers can reach you for questions',
                },
                {
                  label: 'Description filled in',
                  done: !!event.description,
                  hint: 'Tell attendees what to expect',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    item.done
                      ? 'border-green-200 bg-green-50'
                      : 'border-neutral-200 bg-neutral-50'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      item.done ? 'text-green-500' : 'text-neutral-300'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{item.label}</p>
                    {!item.done && (
                      <p className="text-xs text-neutral-400 mt-0.5">{item.hint}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={copyLink} icon={<Copy className="w-4 h-4" />} fullWidth>
              Copy Link
            </Button>
            <a href={eventUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button
                variant="outline"
                icon={<ExternalLink className="w-4 h-4" />}
                fullWidth
              >
                Preview Event Page
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
