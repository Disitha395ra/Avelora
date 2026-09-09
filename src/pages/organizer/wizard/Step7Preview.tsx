import { Calendar, MapPin, Users, Ticket, Lock, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EVENT_TYPE_LABELS, formatCurrency } from '@/utils';
import type { WizardData } from '../CreateEventPage';

interface Props {
  data: WizardData;
}

export function Step7Preview({ data }: Props) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Preview</h2>
        <p className="text-sm text-neutral-500 mt-1">
          This is how your event will appear to attendees. Review everything before publishing.
        </p>
      </div>

      {/* Event card preview */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        {/* Cover */}
        <div className="relative h-48 bg-neutral-100">
          {data.cover_image_url ? (
            <img src={data.cover_image_url} alt={data.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <span className="text-sm">No cover image</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="primary">{EVENT_TYPE_LABELS[data.event_type] || data.event_type}</Badge>
            {data.is_private && <Badge variant="outline"><Lock className="w-3 h-3 inline mr-1" />Private</Badge>}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-1">{data.title || 'Event Title'}</h3>
          <p className="text-sm text-neutral-500 mb-4">{data.short_description || 'Short description...'}</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-neutral-400">Date</p>
                <p className="text-sm font-medium text-neutral-900">
                  {data.start_date || '—'} {data.start_time && `at ${data.start_time}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-neutral-400">Location</p>
                <p className="text-sm font-medium text-neutral-900">
                  {data.venue_type === 'online' ? 'Online Event' :
                    data.venue_type === 'hybrid' ? `Hybrid · ${data.city || '—'}` :
                    `${data.city || '—'}${data.country ? ', ' + data.country : ''}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-neutral-400">Capacity</p>
                <p className="text-sm font-medium text-neutral-900">
                  {data.ticket_types.reduce((s, t) => s + t.quantity, 0)} tickets
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-neutral-400">Organizer</p>
                <p className="text-sm font-medium text-neutral-900">{data.organizer_name || '—'}</p>
              </div>
            </div>
          </div>

          {/* Tickets preview */}
          <div className="border-t border-neutral-100 pt-4">
            <p className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-brand-500" /> Ticket Types
            </p>
            <div className="space-y-2">
              {data.ticket_types.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{t.name || `Ticket ${i + 1}`}</p>
                    {t.description && <p className="text-xs text-neutral-500">{t.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900">
                      {t.price === 0 ? 'Free' : formatCurrency(t.price, data.currency)}
                    </p>
                    <p className="text-xs text-neutral-400">{t.quantity} available</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm font-medium text-amber-800">Review complete?</p>
        <p className="text-xs text-amber-700 mt-0.5">
          If everything looks good, proceed to publish your event. You can still edit all details after publishing.
        </p>
      </div>
    </div>
  );
}
