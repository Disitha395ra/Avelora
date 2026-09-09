import { useEffect } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import type { WizardData } from '../CreateEventPage';

interface Props {
  data: WizardData;
  updateData: (u: Partial<WizardData>) => void;
  onValid: (v: boolean) => void;
}

export function Step6Settings({ data, updateData, onValid }: Props) {
  useEffect(() => {
    onValid(!!data.contact_email);
  }, [data.contact_email]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Event Settings</h2>
        <p className="text-sm text-neutral-500 mt-1">Configure policies, capacity, and contact information.</p>
      </div>

      <div className="space-y-6">
        {/* Capacity & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Maximum Capacity"
            type="number"
            min="1"
            placeholder="Leave blank to use ticket quantities"
            value={data.max_capacity ?? ''}
            onChange={(e) => updateData({ max_capacity: e.target.value ? parseInt(e.target.value) : null })}
            hint="Optional overall cap across all ticket types"
          />
          <Input
            label="Booking Deadline"
            type="datetime-local"
            value={data.booking_deadline}
            onChange={(e) => updateData({ booking_deadline: e.target.value })}
            hint="Last date/time bookings are accepted"
          />
        </div>

        {/* Visibility */}
        <div className="p-4 border border-neutral-200 rounded-xl">
          <p className="text-sm font-semibold text-neutral-800 mb-3">Event Visibility</p>
          <div className="flex flex-col gap-3">
            {[
              { value: false, label: 'Public', desc: 'Listed in Avelora marketplace and searchable by anyone.' },
              { value: true, label: 'Private', desc: 'Only accessible via your unique event URL. Not listed in marketplace.' },
            ].map((opt) => (
              <label key={String(opt.value)} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="is_private"
                  checked={data.is_private === opt.value}
                  onChange={() => updateData({ is_private: opt.value })}
                  className="mt-0.5 accent-brand-500"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-800">{opt.label}</p>
                  <p className="text-xs text-neutral-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Cancellations */}
        <div className="p-4 border border-neutral-200 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.allow_cancellations}
              onChange={(e) => updateData({ allow_cancellations: e.target.checked })}
              className="w-4 h-4 accent-brand-500"
            />
            <div>
              <p className="text-sm font-medium text-neutral-800">Allow attendee cancellations</p>
              <p className="text-xs text-neutral-500">Attendees can cancel their booking subject to your refund policy.</p>
            </div>
          </label>
        </div>

        {/* Refund policy */}
        <Textarea
          label="Refund Policy"
          placeholder="e.g. Full refund if cancelled 7 days before the event. No refunds within 48 hours of the event."
          value={data.refund_policy}
          onChange={(e) => updateData({ refund_policy: e.target.value })}
          rows={3}
        />

        {/* Terms */}
        <Textarea
          label="Terms & Conditions"
          placeholder="Any terms, code of conduct, or requirements for attendees..."
          value={data.terms_and_conditions}
          onChange={(e) => updateData({ terms_and_conditions: e.target.value })}
          rows={4}
        />

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Email"
            type="email"
            placeholder="info@yourevent.com"
            value={data.contact_email}
            onChange={(e) => updateData({ contact_email: e.target.value })}
            required
          />
          <Input
            label="Contact Phone"
            type="tel"
            placeholder="+1 555 000 0000"
            value={data.contact_phone}
            onChange={(e) => updateData({ contact_phone: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
