import { Users, Calendar, CreditCard, TrendingUp, Globe, BarChart3 } from 'lucide-react';
import { StatsCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';

const ADMIN_STATS = [
  { label: 'Total Users', value: '12,847', change: '+340 this week', changeType: 'positive' as const, icon: <Users className="w-5 h-5 text-blue-500" />, iconColor: 'bg-blue-50' },
  { label: 'Total Events', value: '4,291', change: '+82 this month', changeType: 'positive' as const, icon: <Calendar className="w-5 h-5 text-brand-500" />, iconColor: 'bg-brand-50' },
  { label: 'Platform Revenue', value: '$148,920', change: '+18.2% vs last month', changeType: 'positive' as const, icon: <CreditCard className="w-5 h-5 text-green-500" />, iconColor: 'bg-green-50' },
  { label: 'Ticket Volume', value: '$2.4M', change: 'All time', changeType: 'neutral' as const, icon: <TrendingUp className="w-5 h-5 text-violet-500" />, iconColor: 'bg-violet-50' },
  { label: 'Countries', value: '58', change: '5 new this quarter', changeType: 'positive' as const, icon: <Globe className="w-5 h-5 text-orange-500" />, iconColor: 'bg-orange-50' },
  { label: 'Active Events', value: '312', change: 'Live right now', changeType: 'neutral' as const, icon: <BarChart3 className="w-5 h-5 text-red-500" />, iconColor: 'bg-red-50' },
];

const RECENT_EVENTS = [
  { title: 'FutureTech Summit 2026', organizer: 'TechVentures Inc.', country: 'USA', status: 'published', revenue: '$31,200' },
  { title: 'Global Innovation Symposium', organizer: 'Global Innovate Forum', country: 'UK', status: 'published', revenue: '£18,400' },
  { title: 'Colombo Symphony Night', organizer: 'Symphony Sri Lanka', country: 'LK', status: 'published', revenue: 'LKR 4.2M' },
  { title: 'Digital Business Forum', organizer: 'BusinessBridge MENA', country: 'UAE', status: 'draft', revenue: '$0' },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Platform Overview</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Monitor the Avelora platform in real time.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {ADMIN_STATS.map(s => <StatsCard key={s.label} {...s} />)}
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="p-5 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Recent Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {['Event', 'Organizer', 'Country', 'Status', 'Revenue'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {RECENT_EVENTS.map(e => (
                <tr key={e.title} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-neutral-900">{e.title}</td>
                  <td className="px-5 py-3 text-sm text-neutral-600">{e.organizer}</td>
                  <td className="px-5 py-3 text-sm text-neutral-500">{e.country}</td>
                  <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-5 py-3 text-sm font-semibold text-neutral-900">{e.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
