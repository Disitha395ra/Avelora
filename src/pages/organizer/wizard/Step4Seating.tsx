import { useEffect } from 'react';
import { Users, Layout, Table, Pencil } from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { WizardData } from '../CreateEventPage';

interface Props {
  data: WizardData;
  updateData: (u: Partial<WizardData>) => void;
  onValid: (v: boolean) => void;
}

const SEATING_TYPES = [
  {
    value: 'general_admission' as const,
    label: 'General Admission',
    icon: Users,
    description: 'First-come, first-served. No assigned seats.',
    example: 'Concerts, Festivals, Community events',
  },
  {
    value: 'reserved' as const,
    label: 'Reserved Seating',
    icon: Layout,
    description: 'Each attendee selects a specific seat.',
    example: 'Theatres, Conferences, Seminars',
  },
  {
    value: 'table' as const,
    label: 'Table Seating',
    icon: Table,
    description: 'Seating arranged by tables or groups.',
    example: 'Galas, Award Ceremonies, Banquets',
  },
  {
    value: 'custom' as const,
    label: 'Custom Layout',
    icon: Pencil,
    description: 'Build your own seating map with sections, rows, and zones.',
    example: 'Exhibitions, Hybrid events, Unique venues',
  },
];

export function Step4Seating({ data, updateData, onValid }: Props) {
  useEffect(() => {
    if (data.seating_type === 'reserved') {
      onValid(data.seating_layout && data.seating_layout.length > 0);
    } else {
      onValid(!!data.seating_type);
    }
  }, [data.seating_type, data.seating_layout]);

  const addSection = () => {
    const newSection = {
      id: Math.random().toString(36).substring(7),
      name: `Section ${data.seating_layout.length + 1}`,
      rows: 5,
      seatsPerRow: 10,
      price: 50
    };
    updateData({ seating_layout: [...(data.seating_layout || []), newSection] });
  };

  const updateSection = (id: string, updates: any) => {
    updateData({
      seating_layout: data.seating_layout.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const removeSection = (id: string) => {
    updateData({
      seating_layout: data.seating_layout.filter(s => s.id !== id)
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Seating Configuration</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Choose how your event venue is structured. You can configure the detailed seating map after publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SEATING_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => updateData({ seating_type: type.value })}
            className={cn(
              'flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all duration-150 group',
              data.seating_type === type.value
                ? 'border-brand-500 bg-brand-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors',
              data.seating_type === type.value ? 'bg-brand-100' : 'bg-neutral-100 group-hover:bg-neutral-200'
            )}>
              <type.icon className={cn(
                'w-5 h-5 transition-colors',
                data.seating_type === type.value ? 'text-brand-600' : 'text-neutral-500'
              )} />
            </div>
            <p className={cn(
              'text-sm font-semibold mb-1',
              data.seating_type === type.value ? 'text-brand-700' : 'text-neutral-900'
            )}>
              {type.label}
            </p>
            <p className="text-xs text-neutral-500 leading-relaxed mb-2">{type.description}</p>
            <p className="text-xs text-neutral-400 italic">{type.example}</p>
          </button>
        ))}
      </div>

      {data.seating_type === 'reserved' ? (
        <div className="mt-8 border-t border-neutral-200 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Seating Builder</h3>
              <p className="text-sm text-neutral-500">Define sections, rows, and seats.</p>
            </div>
            <Button variant="outline" size="sm" onClick={addSection}>+ Add Section</Button>
          </div>

          <div className="space-y-4">
            {data.seating_layout?.map((section) => (
              <div key={section.id} className="p-4 bg-white border border-neutral-200 rounded-xl flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-neutral-700">Section Name</label>
                  <Input value={section.name} onChange={e => updateSection(section.id, { name: e.target.value })} className="mt-1" />
                </div>
                <div className="w-24">
                  <label className="text-xs font-semibold text-neutral-700">Rows</label>
                  <Input type="number" value={section.rows} onChange={e => updateSection(section.id, { rows: parseInt(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div className="w-24">
                  <label className="text-xs font-semibold text-neutral-700">Seats/Row</label>
                  <Input type="number" value={section.seatsPerRow} onChange={e => updateSection(section.id, { seatsPerRow: parseInt(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div className="w-32">
                  <label className="text-xs font-semibold text-neutral-700">Ticket Price</label>
                  <Input type="number" value={section.price} onChange={e => updateSection(section.id, { price: parseInt(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div className="pt-6">
                  <button onClick={() => removeSection(section.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {(!data.seating_layout || data.seating_layout.length === 0) && (
              <div className="p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                <p className="text-sm text-neutral-500 mb-4">No sections added yet.</p>
                <Button variant="primary" onClick={addSection}>Add First Section</Button>
              </div>
            )}
          </div>
        </div>
      ) : data.seating_type && (
        <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <p className="text-sm font-medium text-neutral-700">
            ✓ Selected: {SEATING_TYPES.find(t => t.value === data.seating_type)?.label}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            General seating requires no detailed map.
          </p>
        </div>
      )}
    </div>
  );
}
