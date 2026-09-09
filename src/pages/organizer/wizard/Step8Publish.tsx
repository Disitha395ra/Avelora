import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Rocket, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { generateSlug, SITE_URL } from '@/utils';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/AuthContext';
import toast from 'react-hot-toast';
import type { WizardData } from '../CreateEventPage';

interface Props {
  data: WizardData;
}

export function Step8Publish({ data }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [eventSlug, setEventSlug] = useState('');

  const slug = generateSlug(data.title) || 'your-event';
  const previewUrl = `${SITE_URL}/event/${slug}`;

  const handlePublish = async () => {
    if (!user) { toast.error('Please sign in to publish.'); return; }
    setPublishing(true);

    try {
      const getDirectImageUrl = (url: string | null | undefined) => {
        if (!url) return null;
        const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        return driveMatch ? `https://drive.google.com/uc?id=${driveMatch[1]}` : url;
      };

      // Create the event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          title: data.title,
          slug: slug + '-' + Date.now().toString(36),
          short_description: data.short_description,
          description: data.description,
          event_type: data.event_type,
          status: 'published',
          is_private: data.is_private,
          cover_image_url: getDirectImageUrl(data.cover_image_url),
          organizer_name: data.organizer_name,
          start_date: data.start_date,
          end_date: data.end_date,
          start_time: data.start_time,
          end_time: data.end_time,
          timezone: data.timezone,
          venue_type: data.venue_type,
          seating_type: data.seating_type,
          max_capacity: data.max_capacity,
          booking_deadline: data.booking_deadline || null,
          allow_cancellations: data.allow_cancellations,
          refund_policy: data.refund_policy || null,
          terms_and_conditions: data.terms_and_conditions || null,
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          currency: data.currency,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create location
      if (data.city || data.online_url) {
        await supabase.from('event_locations').insert({
          event_id: event.id,
          venue_name: data.venue_name || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          country: data.country || null,
          online_url: data.online_url || null,
          online_platform: data.online_platform || null,
        });
      }

      // Create ticket types
      for (let i = 0; i < data.ticket_types.length; i++) {
        const t = data.ticket_types[i];
        await supabase.from('ticket_types').insert({
          event_id: event.id,
          name: t.name,
          description: t.description || null,
          price: t.price,
          currency: data.currency,
          quantity: t.quantity,
          quantity_sold: 0,
          sale_start: t.sale_start || null,
          sale_end: t.sale_end || null,
          is_active: true,
          sort_order: i,
        });
      }

      // Create seating layout if reserved
      if (data.seating_type === 'reserved' && data.seating_layout?.length > 0) {
        let sortOrder = 0;
        for (const section of data.seating_layout) {
          const { data: sectionData, error: sectionError } = await supabase.from('seating_sections').insert({
            event_id: event.id,
            name: section.name,
            capacity: section.rows * section.seatsPerRow,
            price_override: section.price,
            sort_order: sortOrder++
          }).select().single();

          if (sectionError) throw sectionError;

          for (let r = 1; r <= section.rows; r++) {
            const rowLabel = String.fromCharCode(64 + r); // A, B, C...
            const { data: rowData, error: rowError } = await supabase.from('seating_rows').insert({
              section_id: sectionData.id,
              event_id: event.id,
              label: rowLabel,
              sort_order: r
            }).select().single();

            if (rowError) throw rowError;

            const seatsToInsert = Array.from({ length: section.seatsPerRow }).map((_, s) => ({
              event_id: event.id,
              section_id: sectionData.id,
              row_id: rowData.id,
              label: `${rowLabel}${s + 1}`,
              row_label: rowLabel,
              seat_number: `${s + 1}`,
              price: section.price
            }));

            if (seatsToInsert.length > 0) {
              const { error: seatsError } = await supabase.from('seats').insert(seatsToInsert);
              if (seatsError) throw seatsError;
            }
          }
        }
      }

      setEventSlug(event.slug);
      setPublished(true);
      toast.success('🎉 Event published successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to publish event';
      toast.error(message);
    } finally {
      setPublishing(false);
    }
  };

  if (published) {
    const liveUrl = `${SITE_URL}/event/${eventSlug}`;
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Event Published! 🎉</h2>
        <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
          Your event is now live. Share the link below with your attendees.
        </p>

        <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-xl mb-6 max-w-lg mx-auto">
          <span className="flex-1 text-sm font-mono text-neutral-700 truncate">{liveUrl}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(liveUrl); toast.success('Link copied!'); }}
            className="p-2 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a href={liveUrl} target="_blank" rel="noopener noreferrer"
            className="p-2 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={liveUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" icon={<ExternalLink className="w-4 h-4" />}>View Event Page</Button>
          </a>
          <Button onClick={() => navigate('/organizer/events')}>
            Go to My Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Publish Your Event</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Your event will go live immediately and attendees can start booking.
        </p>
      </div>

      {/* Summary checklist */}
      <div className="space-y-2 mb-8">
        {[
          { label: 'Event name', value: data.title, done: !!data.title },
          { label: 'Event type', value: data.event_type, done: !!data.event_type },
          { label: 'Date & time', value: data.start_date, done: !!data.start_date && !!data.end_date },
          { label: 'Location', value: data.venue_type, done: true },
          { label: 'Seating type', value: data.seating_type, done: !!data.seating_type },
          { label: 'Ticket types', value: `${data.ticket_types.length} type(s)`, done: data.ticket_types.length > 0 },
          { label: 'Contact email', value: data.contact_email, done: !!data.contact_email },
        ].map((item) => (
          <div key={item.label} className={`flex items-center gap-3 p-3 rounded-lg border ${item.done ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.done ? 'text-green-500' : 'text-red-300'}`} />
            <span className="text-sm font-medium text-neutral-700">{item.label}</span>
            <span className="ml-auto text-xs text-neutral-500 truncate max-w-[200px]">
              {item.value || 'Missing'}
            </span>
          </div>
        ))}
      </div>

      {/* Public URL preview */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl mb-6">
        <p className="text-xs font-medium text-neutral-500 mb-1">Your event URL will be:</p>
        <p className="text-sm font-mono text-neutral-900 break-all">{previewUrl}</p>
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={handlePublish}
        loading={publishing}
        disabled={!data.title || !data.event_type || !data.start_date || !data.contact_email}
        icon={<Rocket className="w-4 h-4" />}
        iconPosition="right"
      >
        {publishing ? 'Publishing...' : 'Publish Event'}
      </Button>

      <p className="mt-3 text-center text-xs text-neutral-400">
        You can edit all event details after publishing from your dashboard.
      </p>
    </div>
  );
}
