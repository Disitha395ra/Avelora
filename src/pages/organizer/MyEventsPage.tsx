import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { useState } from 'react';

const EVENTS = [
  { id: '1', title: 'FutureTech Summit 2026', type: 'Conference', date: 'Mar 12–14, 2026', status: 'published', sold: 2165, capacity: 2600, revenue: '$31,200', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&auto=format&fit=crop&q=80' },
  { id: '2', title: 'Startup Masterclass Series', type: 'Workshop', date: 'Feb 18, 2026', status: 'published', sold: 48, capacity: 50, revenue: '$4,320', image: 'https://images.unsplash.com/photo-1558403194-611308249627?w=80&auto=format&fit=crop&q=80' },
  { id: '3', title: 'Annual Awards Night 2026', type: 'Award Ceremony', date: 'Jan 30, 2026', status: 'completed', sold: 380, capacity: 400, revenue: '$13,400', image: 'https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=80&auto=format&fit=crop&q=80' },
  { id: '4', title: 'Product Design Sprint', type: 'Workshop', date: 'Apr 5, 2026', status: 'draft', sold: 0, capacity: 30, revenue: '$0', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=80&auto=format&fit=crop&q=80' },
];

export default function MyEventsPage() {
  const [search, setSearch] = useState('');
  const filtered = EVENTS.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Events</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{EVENTS.length} events</p>
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
            {filtered.map(event => {
              const pct = Math.round((event.sold / event.capacity) * 100);
              return (
                <tr key={event.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={event.image} alt={event.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <span className="text-sm font-medium text-neutral-900">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{event.type}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{event.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={event.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-neutral-100 rounded-full">
                        <div className="h-1.5 bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-neutral-500">{event.sold}/{event.capacity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-neutral-900">{event.revenue}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/event/${event.id}`} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100"><Eye className="w-4 h-4" /></Link>
                      <button className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100"><MoreHorizontal className="w-4 h-4" /></button>
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
