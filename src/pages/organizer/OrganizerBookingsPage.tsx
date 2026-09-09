import { StatusBadge } from '@/components/ui/Badge';

const BOOKINGS = [
  { ref: 'AVL-2026-001847', attendee: 'Sarah Mitchell', email: 'sarah@example.com', event: 'FutureTech Summit 2026', ticket: 'Professional', qty: 1, amount: '$399', status: 'confirmed', date: 'Mar 8, 2026' },
  { ref: 'AVL-2026-001846', attendee: 'Marcus Chen', email: 'marcus@example.com', event: 'FutureTech Summit 2026', ticket: 'General', qty: 2, amount: '$398', status: 'confirmed', date: 'Mar 8, 2026' },
  { ref: 'AVL-2026-001845', attendee: 'Priya Sharma', email: 'priya@example.com', event: 'Startup Masterclass', ticket: 'Standard', qty: 1, amount: '$89', status: 'confirmed', date: 'Mar 7, 2026' },
  { ref: 'AVL-2026-001844', attendee: 'James Okafor', email: 'james@example.com', event: 'FutureTech Summit 2026', ticket: 'VIP', qty: 1, amount: '$899', status: 'confirmed', date: 'Mar 7, 2026' },
  { ref: 'AVL-2026-001843', attendee: 'Amara Williams', email: 'amara@example.com', event: 'FutureTech Summit 2026', ticket: 'Professional', qty: 1, amount: '$399', status: 'cancelled', date: 'Mar 6, 2026' },
];

export default function OrganizerBookingsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Bookings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">All bookings across your events</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Bookings', value: '1,847' },
          { label: 'Confirmed', value: '1,812' },
          { label: 'Cancelled', value: '35' },
          { label: 'Total Revenue', value: '$48,920' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {['Reference', 'Attendee', 'Event', 'Ticket', 'Qty', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {BOOKINGS.map(b => (
                <tr key={b.ref} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-neutral-500 whitespace-nowrap">{b.ref}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-neutral-900">{b.attendee}</p>
                    <p className="text-xs text-neutral-400">{b.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 max-w-[150px] truncate">{b.event}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{b.ticket}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{b.qty}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-neutral-900">{b.amount}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">{b.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
