import { useEffect } from 'react';
import { MapPin, Globe, Wifi } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils';
import type { WizardData } from '../CreateEventPage';

interface Props {
  data: WizardData;
  updateData: (u: Partial<WizardData>) => void;
  onValid: (v: boolean) => void;
}

const VENUE_TYPES = [
  { value: 'physical', label: 'Physical Venue', icon: MapPin, description: 'In-person event at a physical location' },
  { value: 'online', label: 'Online', icon: Wifi, description: 'Virtual event via streaming or meeting platform' },
  { value: 'hybrid', label: 'Hybrid', icon: Globe, description: 'Both in-person and online attendance' },
] as const;

export function Step3Location({ data, updateData, onValid }: Props) {
  useEffect(() => {
    if (data.venue_type === 'physical') {
      onValid(!!data.city && !!data.country);
    } else if (data.venue_type === 'online') {
      onValid(true);
    } else {
      onValid(!!data.city);
    }
  }, [data.venue_type, data.city, data.country, data.online_url]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Location</h2>
        <p className="text-sm text-neutral-500 mt-1">Where will your event take place?</p>
      </div>

      {/* Venue type selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {VENUE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => updateData({ venue_type: type.value })}
            className={cn(
              'flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-150',
              data.venue_type === type.value
                ? 'border-brand-500 bg-brand-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            )}
          >
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center mb-3',
              data.venue_type === type.value ? 'bg-brand-100' : 'bg-neutral-100'
            )}>
              <type.icon className={cn('w-4 h-4', data.venue_type === type.value ? 'text-brand-600' : 'text-neutral-500')} />
            </div>
            <p className={cn('text-sm font-semibold', data.venue_type === type.value ? 'text-brand-700' : 'text-neutral-900')}>
              {type.label}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">{type.description}</p>
          </button>
        ))}
      </div>

      {/* Physical fields */}
      {(data.venue_type === 'physical' || data.venue_type === 'hybrid') && (
        <div className="space-y-4">
          <Input
            label="Venue Name"
            placeholder="e.g. Moscone Center"
            value={data.venue_name}
            onChange={(e) => updateData({ venue_name: e.target.value })}
          />
          <Input
            label="Street Address"
            placeholder="747 Howard St"
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="San Francisco"
              value={data.city}
              onChange={(e) => updateData({ city: e.target.value })}
              required
            />
            <Input
              label="State / Province"
              placeholder="CA"
              value={data.state}
              onChange={(e) => updateData({ state: e.target.value })}
            />
          </div>
          <Input
            label="Country"
            placeholder="United States"
            value={data.country}
            onChange={(e) => updateData({ country: e.target.value })}
            required
          />
        </div>
      )}

      {/* Online fields */}
      {(data.venue_type === 'online' || data.venue_type === 'hybrid') && (
        <div className={cn('space-y-4', data.venue_type === 'hybrid' && 'mt-6 pt-6 border-t border-neutral-200')}>
          {data.venue_type === 'hybrid' && (
            <p className="text-sm font-semibold text-neutral-700">Online Details</p>
          )}
          <Input
            label="Meeting / Streaming URL"
            type="url"
            placeholder="https://zoom.us/j/... or https://youtube.com/live/..."
            value={data.online_url}
            onChange={(e) => updateData({ online_url: e.target.value })}
          />
          <Input
            label="Platform"
            placeholder="Zoom, Google Meet, YouTube Live, etc."
            value={data.online_platform}
            onChange={(e) => updateData({ online_platform: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
