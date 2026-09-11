import { useState, useEffect } from 'react';
import { Download, TrendingUp, DollarSign, Users, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#c9a84c', '#1a1917', '#3b82f6', '#10b981', '#8b5cf6'];

export default function OrganizerReportsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load organizer's events
  useEffect(() => {
    if (!user) return;
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title, status, start_date, currency')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setEvents(data);
        setSelectedEventId(data[0].id);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [user]);

  // Load data for selected event
  useEffect(() => {
    if (!selectedEventId) return;
    const fetchReport = async () => {
      setLoading(true);

      // Bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, items:booking_items(*, ticket_type:ticket_types(name, price))')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });

      // Ticket types
      const { data: ttData } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', selectedEventId);

      // Seating sections (if reserved)
      const { data: sectionsData } = await supabase
        .from('seating_sections')
        .select('*, seats:seats(status)')
        .eq('event_id', selectedEventId);

      setBookings(bookingsData || []);
      setTicketTypes(ttData || []);
      setSections(sectionsData || []);
      setLoading(false);
    };
    fetchReport();
  }, [selectedEventId]);

  // --- Computed Financials ---
  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const currency = selectedEvent?.currency || 'USD';

  const confirmedBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending',
  );
  const cancelledBookings = bookings.filter(
    (b) => b.status === 'cancelled' || b.status === 'refunded',
  );
  const grossRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total || 0), 0);
  const platformFee = grossRevenue * 0.03;
  const refunds = cancelledBookings.reduce((sum, b) => sum + (b.total || 0), 0);
  const netRevenue = grossRevenue - platformFee - refunds;

  // Ticket breakdown
  const ticketData = ticketTypes.map((tt) => ({
    name: tt.name,
    sold: tt.quantity_sold || 0,
    available: (tt.quantity || 0) - (tt.quantity_sold || 0),
    revenue: (tt.quantity_sold || 0) * tt.price,
  }));

  // Seating analysis
  const sectionData = sections.map((s) => {
    const totalSeats = s.seats?.length || s.capacity || 0;
    const soldSeats = s.seats?.filter((seat: any) => seat.status === 'booked').length || 0;
    return {
      name: s.name,
      total: totalSeats,
      sold: soldSeats,
      available: totalSeats - soldSeats,
      occupancy: totalSeats > 0 ? Math.round((soldSeats / totalSeats) * 100) : 0,
      revenue: soldSeats * (s.price_override || 0),
    };
  });

  // Daily bookings chart (last 14 days)
  const dailyBookings = (() => {
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    confirmedBookings.forEach((b) => {
      const day = b.created_at?.slice(0, 10);
      if (day && days[day] !== undefined) days[day]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: date.slice(5), // MM-DD
      bookings: count,
    }));
  })();

  const fmt = (amount: number) =>
    `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (!loading && events.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <BarChart3 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-neutral-700">No events yet</h2>
        <p className="text-sm text-neutral-400 mt-1">Create and publish an event to see your reports.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Event Reports</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Live analytics and revenue breakdown.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Event selector */}
          <div className="min-w-[220px]">
            <Select
              options={events.map((e) => ({
                value: e.id,
                label: e.title.length > 30 ? e.title.slice(0, 30) + '…' : e.title,
              }))}
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            />
          </div>
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading report…
        </div>
      ) : (
        <>
          {/* Financial Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Gross Revenue',
                value: fmt(grossRevenue),
                sub: `${confirmedBookings.length} bookings`,
                icon: <DollarSign className="w-4 h-4 text-green-500" />,
                color: 'bg-green-50',
              },
              {
                label: 'Platform Fee',
                value: fmt(platformFee),
                sub: '3% of gross',
                icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
                color: 'bg-blue-50',
              },
              {
                label: 'Refunds',
                value: fmt(refunds),
                sub: `${cancelledBookings.length} cancelled`,
                icon: <Users className="w-4 h-4 text-red-500" />,
                color: 'bg-red-50',
              },
              {
                label: 'Net Revenue',
                value: fmt(netRevenue),
                sub: 'After fees & refunds',
                icon: <BarChart3 className="w-4 h-4 text-brand-500" />,
                color: 'bg-brand-50',
              },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-neutral-500">{s.label}</p>
                  <div className={`p-1.5 rounded-lg ${s.color}`}>{s.icon}</div>
                </div>
                <p className="text-xl font-bold text-neutral-900 mt-1">{s.value}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue by ticket type */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="font-semibold text-neutral-900 mb-4">Revenue by Ticket Type</h2>
              {ticketData.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-10">No ticket data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ticketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${currency} ${v}`}
                    />
                    <Tooltip
                      formatter={(v: any) => [fmt(Number(v)), 'Revenue']}
                      contentStyle={{ border: '1px solid #e5e2dc', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" fill="#c9a84c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Tickets sold distribution */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="font-semibold text-neutral-900 mb-4">Tickets Sold Distribution</h2>
              {ticketData.length === 0 || ticketData.every((t) => t.sold === 0) ? (
                <p className="text-sm text-neutral-400 text-center py-10">No tickets sold yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={ticketData}
                      dataKey="sold"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) =>
                        `${name} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                    >
                      {ticketData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Daily Bookings Chart */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Daily Bookings (Last 14 Days)</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={dailyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ border: '1px solid #e5e2dc', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#c9a84c"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#c9a84c' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Ticket Type Analysis Table */}
          {ticketData.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-xl mb-6">
              <div className="p-5 border-b border-neutral-100">
                <h2 className="font-semibold text-neutral-900">Ticket Type Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      {['Ticket Type', 'Price', 'Total Qty', 'Sold', 'Available', 'Revenue'].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {ticketTypes.map((tt) => {
                      const sold = tt.quantity_sold || 0;
                      const available = (tt.quantity || 0) - sold;
                      const rev = sold * tt.price;
                      return (
                        <tr key={tt.id} className="hover:bg-neutral-50">
                          <td className="px-5 py-3 text-sm font-medium text-neutral-900">
                            {tt.name}
                          </td>
                          <td className="px-5 py-3 text-sm text-neutral-600">
                            {fmt(tt.price)}
                          </td>
                          <td className="px-5 py-3 text-sm text-neutral-600">{tt.quantity}</td>
                          <td className="px-5 py-3 text-sm text-green-600 font-medium">{sold}</td>
                          <td className="px-5 py-3 text-sm text-neutral-400">{available}</td>
                          <td className="px-5 py-3 text-sm font-semibold text-neutral-900">
                            {fmt(rev)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Seating Analysis (if reserved seating) */}
          {sectionData.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-xl mb-6">
              <div className="p-5 border-b border-neutral-100">
                <h2 className="font-semibold text-neutral-900">Seating Zone Analysis</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      {['Zone', 'Capacity', 'Sold', 'Available', 'Occupancy', 'Revenue'].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {sectionData.map((s) => (
                      <tr key={s.name} className="hover:bg-neutral-50">
                        <td className="px-5 py-3 text-sm font-medium text-neutral-900">{s.name}</td>
                        <td className="px-5 py-3 text-sm text-neutral-600">{s.total}</td>
                        <td className="px-5 py-3 text-sm text-green-600 font-medium">{s.sold}</td>
                        <td className="px-5 py-3 text-sm text-neutral-400">{s.available}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-neutral-100 rounded-full">
                              <div
                                className="h-1.5 bg-brand-500 rounded-full"
                                style={{ width: `${s.occupancy}%` }}
                              />
                            </div>
                            <span className="text-xs text-neutral-500">{s.occupancy}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-neutral-900">
                          {fmt(s.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Bookings */}
          <div className="bg-white border border-neutral-200 rounded-xl">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Recent Bookings</h2>
              <span className="text-xs text-neutral-400">{bookings.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    {['Reference', 'Date', 'Amount', 'Status'].map((h) => (
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
                  {bookings.slice(0, 20).map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 text-xs font-mono text-neutral-500">
                        {b.booking_reference}
                      </td>
                      <td className="px-5 py-3 text-xs text-neutral-400">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-neutral-900">
                        {fmt(b.total || 0)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-sm text-neutral-400"
                      >
                        No bookings yet for this event.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
