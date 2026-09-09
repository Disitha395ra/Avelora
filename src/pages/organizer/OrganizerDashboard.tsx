import { Link } from 'react-router-dom';
import {
  Calendar, TrendingUp, DollarSign, Users, Plus, ArrowRight,
  Eye, Edit, BarChart3, CheckCircle2, BookOpen
} from 'lucide-react';

import { StatsCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Mock data — replace with Supabase queries
const STATS = [
  { label: 'Total Events', value: '12', change: '+2 this month', changeType: 'positive' as const, icon: <Calendar className="w-5 h-5 text-brand-500" />, iconColor: 'bg-brand-50' },
  { label: 'Total Bookings', value: '1,847', change: '+234 this week', changeType: 'positive' as const, icon: <Users className="w-5 h-5 text-green-500" />, iconColor: 'bg-green-50' },
  { label: 'Revenue', value: '$48,920', change: '+12.4% vs last month', changeType: 'positive' as const, icon: <DollarSign className="w-5 h-5 text-blue-500" />, iconColor: 'bg-blue-50' },
  { label: 'Conversion Rate', value: '74.2%', change: '+2.1% vs last month', changeType: 'positive' as const, icon: <TrendingUp className="w-5 h-5 text-violet-500" />, iconColor: 'bg-violet-50' },
];

const REVENUE_DATA = [
  { month: 'Oct', revenue: 4200, bookings: 82 },
  { month: 'Nov', revenue: 6800, bookings: 134 },
  { month: 'Dec', revenue: 5900, bookings: 110 },
  { month: 'Jan', revenue: 9200, bookings: 180 },
  { month: 'Feb', revenue: 11400, bookings: 224 },
  { month: 'Mar', revenue: 11120, bookings: 217 },
];

const MY_EVENTS = [
  {
    id: '1', title: 'FutureTech Summit 2026', type: 'Conference',
    date: 'Mar 12–14, 2026', status: 'published', sold: 2165, capacity: 2600, revenue: '$31,200',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: '2', title: 'Startup Masterclass Series', type: 'Workshop',
    date: 'Feb 18, 2026', status: 'published', sold: 48, capacity: 50, revenue: '$4,320',
    image: 'https://images.unsplash.com/photo-1558403194-611308249627?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: '3', title: 'Annual Awards Night 2026', type: 'Award Ceremony',
    date: 'Jan 30, 2026', status: 'completed', sold: 380, capacity: 400, revenue: '$13,400',
    image: 'https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: '4', title: 'Product Design Sprint', type: 'Workshop',
    date: 'Apr 5, 2026', status: 'draft', sold: 0, capacity: 30, revenue: '$0',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=100&auto=format&fit=crop&q=80',
  },
];

const RECENT_BOOKINGS = [
  { ref: 'AVL-2026-001847', attendee: 'Sarah Mitchell', event: 'FutureTech Summit 2026', amount: '$399', status: 'confirmed', time: '2 min ago' },
  { ref: 'AVL-2026-001846', attendee: 'Marcus Chen', event: 'FutureTech Summit 2026', amount: '$199', status: 'confirmed', time: '18 min ago' },
  { ref: 'AVL-2026-001845', attendee: 'Priya Sharma', event: 'Startup Masterclass', amount: '$89', status: 'confirmed', time: '1 hr ago' },
  { ref: 'AVL-2026-001844', attendee: 'James Okafor', event: 'FutureTech Summit 2026', amount: '$899', status: 'confirmed', time: '2 hr ago' },
  { ref: 'AVL-2026-001843', attendee: 'Amara Williams', event: 'FutureTech Summit 2026', amount: '$399', status: 'cancelled', time: '3 hr ago' },
];

export default function OrganizerDashboard() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'Organizer';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Good morning, {firstName} 👋</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Here's what's happening with your events today.</p>
        </div>
        <Link to="/organizer/events/create">
          <Button icon={<Plus className="w-4 h-4" />}>Create Event</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-neutral-900">Revenue Overview</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Last 6 months</p>
            </div>
            <select className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 text-neutral-600 bg-white">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8f8880' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8f8880' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                contentStyle={{ border: '1px solid #e5e2dc', borderRadius: '8px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#c9a84c" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Create a new event', href: '/organizer/events/create', icon: Plus },
              { label: 'View all bookings', href: '/organizer/bookings', icon: BookOpen },
              { label: 'Download reports', href: '/organizer/reports', icon: BarChart3 },
              { label: 'Manage staff', href: '/organizer/staff', icon: Users },
            ].map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 text-sm text-neutral-700 group transition-colors border border-transparent hover:border-neutral-200"
              >
                <action.icon className="w-4 h-4 text-neutral-400 group-hover:text-brand-500 transition-colors" />
                {action.label}
                <ArrowRight className="w-3.5 h-3.5 ml-auto text-neutral-300 group-hover:text-brand-500 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Upcoming event alert */}
          <div className="mt-6 p-3 bg-brand-50 border border-brand-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-brand-800">Event in 4 days</p>
                <p className="text-xs text-brand-600">FutureTech Summit 2026 starts Mar 12</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Events */}
      <div className="bg-white border border-neutral-200 rounded-xl mb-6">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">My Events</h2>
          <Link to="/organizer/events" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-neutral-100">
          {MY_EVENTS.map((event) => {
            const pct = Math.round((event.sold / event.capacity) * 100);
            return (
              <div key={event.id} className="flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors">
                <img src={event.image} alt={event.title} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-neutral-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{event.title}</p>
                    <StatusBadge status={event.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span>{event.type}</span>
                    <span>·</span>
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 max-w-32 h-1 bg-neutral-100 rounded-full">
                      <div className="h-1 bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-neutral-500">{event.sold}/{event.capacity} sold</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-neutral-900">{event.revenue}</p>
                  <div className="flex items-center gap-1 mt-2 justify-end">
                    <Link to={`/event/${event.id}`} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <Link to={`/organizer/events/${event.id}/edit`} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Recent Bookings</h2>
          <Link to="/organizer/bookings" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                {['Reference', 'Attendee', 'Event', 'Amount', 'Status', 'Time'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-6 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {RECENT_BOOKINGS.map((b) => (
                <tr key={b.ref} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-3 text-xs font-mono text-neutral-500">{b.ref}</td>
                  <td className="px-6 py-3 text-sm font-medium text-neutral-900">{b.attendee}</td>
                  <td className="px-6 py-3 text-sm text-neutral-600 max-w-[160px] truncate">{b.event}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-neutral-900">{b.amount}</td>
                  <td className="px-6 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-6 py-3 text-xs text-neutral-400">{b.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

