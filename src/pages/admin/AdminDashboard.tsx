import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import {
  Users, Calendar, CreditCard, TrendingUp, Globe, BarChart3,
  ArrowRight, RefreshCw,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    platformRevenue: 0,
    totalBookings: 0,
    countries: 0,
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      // 1. User count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Event stats
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, status, currency, start_date, organizer:profiles(full_name, email, country), event_locations(country)')
        .order('created_at', { ascending: false });

      const totalEvents = eventsData?.length || 0;
      const activeEvents = eventsData?.filter((e: any) => e.status === 'published').length || 0;

      // Count unique countries
      const countrySet = new Set<string>();
      eventsData?.forEach((e: any) => {
        const c = e.event_locations?.[0]?.country || e.organizer?.country;
        if (c) countrySet.add(c);
      });

      // 3. Booking / revenue
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('total, created_at, status')
        .in('status', ['confirmed', 'pending']);

      const grossRevenue = bookingsData?.reduce((s: number, b: any) => s + (b.total || 0), 0) || 0;
      const platformRevenue = grossRevenue * 0.03; // 3% platform fee

      // 4. Monthly revenue for chart (last 6 months)
      const months: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months[d.toISOString().slice(0, 7)] = 0; // YYYY-MM
      }
      bookingsData?.forEach((b: any) => {
        const month = b.created_at?.slice(0, 7);
        if (month && months[month] !== undefined) {
          months[month] += b.total || 0;
        }
      });
      const chartData = Object.entries(months).map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleString('default', { month: 'short' }),
        revenue: Math.round(revenue * 0.03), // platform fee portion
      }));

      setStats({
        totalUsers: userCount || 0,
        totalEvents,
        activeEvents,
        platformRevenue,
        totalBookings: bookingsData?.length || 0,
        countries: countrySet.size,
      });
      setRecentEvents(eventsData?.slice(0, 8) || []);
      setRevenueData(chartData);
      setLoading(false);
    };

    fetchAdminData();
  }, []);

  const STATS = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="w-5 h-5 text-blue-500" />,
      iconColor: 'bg-blue-50',
    },
    {
      label: 'Total Events',
      value: stats.totalEvents.toLocaleString(),
      icon: <Calendar className="w-5 h-5 text-brand-500" />,
      iconColor: 'bg-brand-50',
    },
    {
      label: 'Platform Revenue',
      value: `$${stats.platformRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      change: '3% of gross',
      changeType: 'neutral' as const,
      icon: <CreditCard className="w-5 h-5 text-green-500" />,
      iconColor: 'bg-green-50',
    },
    {
      label: 'Active Events',
      value: stats.activeEvents.toLocaleString(),
      icon: <TrendingUp className="w-5 h-5 text-violet-500" />,
      iconColor: 'bg-violet-50',
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings.toLocaleString(),
      icon: <BarChart3 className="w-5 h-5 text-orange-500" />,
      iconColor: 'bg-orange-50',
    },
    {
      label: 'Countries',
      value: stats.countries.toLocaleString(),
      icon: <Globe className="w-5 h-5 text-teal-500" />,
      iconColor: 'bg-teal-50',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Platform Overview</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Monitor the Avelora platform in real time.</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading…
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {STATS.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-neutral-900">Platform Revenue (Last 6 Months)</h2>
            <p className="text-xs text-neutral-400 mt-0.5">3% fee portion of all bookings</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8f8880' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#8f8880' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Platform Revenue']}
              contentStyle={{ border: '1px solid #e5e2dc', borderRadius: '8px', fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#c9a84c" strokeWidth={2} fill="url(#adminRevGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Manage Users', href: '/admin/users', icon: Users, sub: `${stats.totalUsers} registered` },
          { label: 'All Events', href: '/admin/events', icon: Calendar, sub: `${stats.activeEvents} active` },
          { label: 'Payments', href: '/admin/payments', icon: CreditCard, sub: `${stats.totalBookings} bookings` },
        ].map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group"
          >
            <div className="p-2.5 bg-brand-50 rounded-xl">
              <item.icon className="w-5 h-5 text-brand-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
              <p className="text-xs text-neutral-400">{item.sub}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-brand-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent Events */}
      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Recent Events</h2>
          <Link to="/admin/events" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {['Event', 'Organizer', 'Country', 'Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentEvents.map((e: any) => (
                <tr key={e.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-neutral-900 max-w-[220px] truncate">
                    {e.title}
                  </td>
                  <td className="px-5 py-3 text-sm text-neutral-600">
                    {e.organizer?.full_name || e.organizer?.email || '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-neutral-500">
                    {e.event_locations?.[0]?.country || e.organizer?.country || '—'}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                </tr>
              ))}
              {recentEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-neutral-400">
                    No events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
