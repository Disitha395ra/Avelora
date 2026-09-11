import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Search, DollarSign, TrendingUp, CreditCard, RefreshCw, CheckCircle2, XCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          event:events(title, currency),
          customer:profiles(full_name, email),
          payment:payments(provider, status, paid_at)
        `)
        .order('created_at', { ascending: false });
      setBookings(data || []);
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchSearch =
      !search ||
      b.booking_reference?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer?.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.event?.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Financial summary
  const confirmedBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending',
  );
  const cancelledBookings = bookings.filter(
    (b) => b.status === 'cancelled' || b.status === 'refunded',
  );
  const grossRevenue = confirmedBookings.reduce((s, b) => s + (b.total || 0), 0);
  const platformFee = grossRevenue * 0.03;
  const refunds = cancelledBookings.reduce((s, b) => s + (b.total || 0), 0);
  const netRevenue = grossRevenue - platformFee - refunds;

  const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'cancelled', 'refunded', 'expired'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Payments & Bookings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Platform-wide booking and revenue data.
        </p>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Gross Revenue',
            value: `$${grossRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            sub: `${confirmedBookings.length} bookings`,
            icon: <DollarSign className="w-4 h-4 text-green-500" />,
            color: 'bg-green-50',
          },
          {
            label: 'Platform Fee (3%)',
            value: `$${platformFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            sub: 'Avelora earnings',
            icon: <TrendingUp className="w-4 h-4 text-brand-500" />,
            color: 'bg-brand-50',
          },
          {
            label: 'Refunded',
            value: `$${refunds.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            sub: `${cancelledBookings.length} cancelled`,
            icon: <XCircle className="w-4 h-4 text-red-500" />,
            color: 'bg-red-50',
          },
          {
            label: 'Net to Organizers',
            value: `$${netRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            sub: 'After fees & refunds',
            icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
            color: 'bg-blue-50',
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search by reference, email, or event…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
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
                {[
                  'Reference',
                  'Customer',
                  'Event',
                  'Amount',
                  'Fee (3%)',
                  'Payment',
                  'Status',
                  'Date',
                ].map((h) => (
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
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const fee = (b.total || 0) * 0.03;
                  const paymentStatus = b.payment?.status || (b.status === 'confirmed' ? 'paid' : 'pending');
                  return (
                    <tr key={b.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-neutral-500">
                        {b.booking_reference}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-neutral-900">
                          {b.customer?.full_name || '—'}
                        </p>
                        <p className="text-xs text-neutral-400">{b.customer?.email || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600 max-w-[160px] truncate">
                        {b.event?.title || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-neutral-900">
                        {b.event?.currency || '$'} {(b.total || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        ${fee.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="text-xs text-neutral-600 capitalize">
                            {b.payment?.provider || 'card'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                        {new Date(b.created_at).toLocaleDateString()}
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
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        )}
      </div>
    </div>
  );
}
