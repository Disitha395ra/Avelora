import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const TICKET_DATA = [
  { name: 'General', sold: 1650, revenue: 328350 },
  { name: 'Professional', sold: 430, revenue: 171570 },
  { name: 'VIP', sold: 85, revenue: 76415 },
];

const SECTION_DATA = [
  { name: 'Main Hall', total: 1800, sold: 1650, available: 150, revenue: 328350 },
  { name: 'Premium Zone', total: 500, sold: 430, available: 70, revenue: 171570 },
  { name: 'VIP Lounge', total: 100, sold: 85, available: 15, revenue: 76415 },
];

const DAILY_DATA = [
  { day: 'Day 1', checkin: 1820 },
  { day: 'Day 2', checkin: 2050 },
  { day: 'Day 3', checkin: 1960 },
];

const COLORS = ['#c9a84c', '#1a1917', '#6b6860'];

export default function OrganizerReportsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Event Reports</h1>
          <p className="text-sm text-neutral-500 mt-0.5">FutureTech Summit 2026 · Post-event analysis</p>
        </div>
        <Button variant="outline" icon={<Download className="w-4 h-4" />}>Download PDF</Button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Gross Revenue', value: '$576,335', sub: 'Before deductions' },
          { label: 'Platform Fees', value: '$17,290', sub: '3% fee' },
          { label: 'Refunds', value: '$3,992', sub: '10 refunds' },
          { label: 'Net Revenue', value: '$555,053', sub: 'After fees & refunds' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-5">
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{s.value}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ticket breakdown */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Revenue by Ticket Type</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TICKET_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#c9a84c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Tickets Sold Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={TICKET_DATA} dataKey="sold" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {TICKET_DATA.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seating analysis */}
      <div className="bg-white border border-neutral-200 rounded-xl mb-6">
        <div className="p-5 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Seating Zone Analysis</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {['Zone', 'Capacity', 'Sold', 'Available', 'Occupancy', 'Revenue'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {SECTION_DATA.map(s => (
                <tr key={s.name} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 text-sm font-medium text-neutral-900">{s.name}</td>
                  <td className="px-5 py-3 text-sm text-neutral-600">{s.total}</td>
                  <td className="px-5 py-3 text-sm text-green-600 font-medium">{s.sold}</td>
                  <td className="px-5 py-3 text-sm text-neutral-400">{s.available}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-neutral-100 rounded-full">
                        <div className="h-1.5 bg-brand-500 rounded-full" style={{ width: `${Math.round(s.sold/s.total*100)}%` }} />
                      </div>
                      <span className="text-xs text-neutral-500">{Math.round(s.sold/s.total*100)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-neutral-900">${s.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="font-semibold text-neutral-900 mb-4">Daily Check-in</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={DAILY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="checkin" name="Check-ins" fill="#1a1917" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
