import { useEffect } from 'react';
import { Input, Select } from '@/components/ui/Input';
import { TIMEZONES } from '@/utils';
import type { WizardData } from '../CreateEventPage';

interface Props {
  data: WizardData;
  updateData: (u: Partial<WizardData>) => void;
  onValid: (v: boolean) => void;
}

export function Step2DateTime({ data, updateData, onValid }: Props) {
  useEffect(() => {
    onValid(!!data.start_date && !!data.end_date && !!data.timezone);
  }, [data.start_date, data.end_date, data.timezone]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Date & Time</h2>
        <p className="text-sm text-neutral-500 mt-1">When does your event take place?</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={data.start_date}
            onChange={(e) => updateData({ start_date: e.target.value })}
            required
          />
          <Input
            label="Start Time"
            type="time"
            value={data.start_time}
            onChange={(e) => updateData({ start_time: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="End Date"
            type="date"
            value={data.end_date}
            min={data.start_date}
            onChange={(e) => updateData({ end_date: e.target.value })}
            required
          />
          <Input
            label="End Time"
            type="time"
            value={data.end_time}
            onChange={(e) => updateData({ end_time: e.target.value })}
            required
          />
        </div>

        <Select
          label="Timezone"
          options={TIMEZONES}
          value={data.timezone}
          onChange={(e) => updateData({ timezone: e.target.value })}
          required
        />

        {data.start_date && data.end_date && (
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
            <p className="text-sm font-medium text-neutral-700">Event Duration</p>
            <p className="text-sm text-neutral-500 mt-1">
              {data.start_date} {data.start_time} → {data.end_date} {data.end_time}
              {' '}({data.timezone})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
