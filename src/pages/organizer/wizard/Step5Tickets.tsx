import { useEffect } from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CURRENCIES } from '@/utils';
import type { WizardData } from '../CreateEventPage';

interface Props {
  data: WizardData;
  updateData: (u: Partial<WizardData>) => void;
  onValid: (v: boolean) => void;
}

export function Step5Tickets({ data, updateData, onValid }: Props) {
  useEffect(() => {
    const valid = data.ticket_types.length > 0 &&
      data.ticket_types.every(t => t.name && t.quantity > 0 && t.price >= 0);
    onValid(valid);
  }, [data.ticket_types]);

  const addTicket = () => {
    updateData({
      ticket_types: [
        ...data.ticket_types,
        { name: '', description: '', price: 0, quantity: 100, sale_start: '', sale_end: '' },
      ],
    });
  };

  const removeTicket = (i: number) => {
    const updated = data.ticket_types.filter((_, idx) => idx !== i);
    updateData({ ticket_types: updated });
  };

  const updateTicket = (i: number, field: string, value: string | number) => {
    const updated = data.ticket_types.map((t, idx) =>
      idx === i ? { ...t, [field]: value } : t
    );
    updateData({ ticket_types: updated });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Ticket Types</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Define your ticket categories, pricing, and availability.
        </p>
      </div>

      {/* Currency */}
      <div className="mb-6">
        <Select
          label="Event Currency"
          options={CURRENCIES.map(c => ({ value: c.code, label: `${c.code} — ${c.label}` }))}
          value={data.currency}
          onChange={(e) => updateData({ currency: e.target.value })}
        />
      </div>

      {/* Ticket list */}
      <div className="space-y-4 mb-4">
        {data.ticket_types.map((ticket, i) => (
          <div key={i} className="p-5 border border-neutral-200 rounded-xl bg-neutral-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-neutral-700">Ticket Type {i + 1}</span>
              {data.ticket_types.length > 1 && (
                <button
                  onClick={() => removeTicket(i)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ticket Name"
                placeholder="e.g. General, VIP, Student"
                value={ticket.name}
                onChange={(e) => updateTicket(i, 'name', e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={ticket.price}
                  onChange={(e) => updateTicket(i, 'price', parseFloat(e.target.value) || 0)}
                  icon={<DollarSign className="w-3.5 h-3.5" />}
                  hint={ticket.price === 0 ? 'Free ticket' : `${data.currency} ${ticket.price}`}
                />
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={ticket.quantity}
                  onChange={(e) => updateTicket(i, 'quantity', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <Input
                label="Description (optional)"
                placeholder="What's included with this ticket?"
                value={ticket.description}
                onChange={(e) => updateTicket(i, 'description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="Sale Start"
                type="datetime-local"
                value={ticket.sale_start}
                onChange={(e) => updateTicket(i, 'sale_start', e.target.value)}
                hint="Leave blank to start immediately"
              />
              <Input
                label="Sale End"
                type="datetime-local"
                value={ticket.sale_end}
                onChange={(e) => updateTicket(i, 'sale_end', e.target.value)}
                hint="Leave blank for no end date"
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addTicket}
        icon={<Plus className="w-4 h-4" />}
      >
        Add Another Ticket Type
      </Button>

      {/* Summary */}
      {data.ticket_types.length > 0 && (
        <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-lg">
          <p className="text-sm font-medium text-brand-800 mb-2">Summary</p>
          <div className="space-y-1">
            {data.ticket_types.map((t, i) => (
              <div key={i} className="flex justify-between text-xs text-brand-700">
                <span>{t.name || `Ticket ${i + 1}`}</span>
                <span>
                  {t.price === 0 ? 'Free' : `${data.currency} ${t.price}`} × {t.quantity} = {' '}
                  <strong>{t.price === 0 ? 'Free' : `${data.currency} ${(t.price * t.quantity).toLocaleString()}`}</strong>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-brand-200 flex justify-between text-xs font-bold text-brand-900">
            <span>Total capacity</span>
            <span>{data.ticket_types.reduce((s, t) => s + t.quantity, 0)} tickets</span>
          </div>
        </div>
      )}
    </div>
  );
}
