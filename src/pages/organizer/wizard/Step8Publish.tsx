import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Rocket, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { generateSlug, SITE_URL, formatCurrency } from '@/utils';
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

  // ✅ FIX 1: Generate the FINAL slug (with timestamp) ONCE, deterministically before publish.
  // This ensures what we show the user matches what gets saved to DB.
  const finalSlug = useMemo(() => {
    const base = generateSlug(data.title) || 'event';
    // Use a stable suffix based on title so it doesn't change on re-render
    const suffix = btoa(data.title + data.start_date).replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase();
    return `${base}-${suffix}`;
  }, [data.title, data.start_date]);

  const previewUrl = `${SITE_URL}/event/${finalSlug}`;

  const handlePublish = async () => {
    if (!user) { toast.error('Please sign in to publish.'); return; }
    setPublishing(true);

    try {
      const getDirectImageUrl = (url: string | null | undefined) => {
        if (!url) return null;
        const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        return driveMatch ? `https://drive.google.com/uc?id=${driveMatch[1]}` : url;
      };

      // Check if slug already exists; if so, append a random suffix
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('slug', finalSlug)
        .maybeSingle();

      const slugToUse = existing
        ? `${finalSlug}-${Date.now().toString(36)}`
        : finalSlug;

      // ── Create the event ─────────────────────────────────────────
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          title: data.title,
          slug: slugToUse,
          short_description: data.short_description || null,
          description: data.description || null,
          event_type: data.event_type,
          status: 'published',
          is_private: data.is_private,
          cover_image_url: getDirectImageUrl(data.cover_image_url),
          organizer_name: data.organizer_name || null,
          start_date: data.start_date,
          end_date: data.end_date,
          start_time: data.start_time,
          end_time: data.end_time,
          timezone: data.timezone,
          venue_type: data.venue_type,
          seating_type: data.seating_type,
          max_capacity: data.max_capacity || null,
          booking_deadline: data.booking_deadline || null,
          allow_cancellations: data.allow_cancellations,
          refund_policy: data.refund_policy || null,
          terms_and_conditions: data.terms_and_conditions || null,
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          currency: data.currency,
          layout_metadata: data.seating_type === 'reserved' ? data.seating_layout : null,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // ── Create location ──────────────────────────────────────────
      if (data.venue_type === 'physical' || data.venue_type === 'hybrid') {
        if (data.venue_name || data.city || data.address) {
          const { error: locError } = await supabase.from('event_locations').insert({
            event_id: event.id,
            venue_name: data.venue_name || null,
            address: data.address || null,
            city: data.city || null,
            state: data.state || null,
            country: data.country || null,
          });
          if (locError) console.warn('Location insert warning:', locError.message);
        }
      }
      if (data.venue_type === 'online' || data.venue_type === 'hybrid') {
        if (data.online_url) {
          await supabase.from('event_locations').upsert({
            event_id: event.id,
            online_url: data.online_url || null,
            online_platform: data.online_platform || null,
          }, { onConflict: 'event_id' });
        }
      }

      // ── Create ticket types ──────────────────────────────────────
      if (data.ticket_types.length > 0) {
        const ticketsPayload = data.ticket_types.map((t, i) => ({
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
        }));

        const { error: ticketsError } = await supabase.from('ticket_types').insert(ticketsPayload);
        if (ticketsError) throw ticketsError;
      }

      // ── Create reserved seating layout ───────────────────────────
      if (data.seating_type === 'reserved' && data.seating_layout?.sections?.length > 0) {
        const layout = data.seating_layout;

        for (let sortOrder = 0; sortOrder < layout.sections.length; sortOrder++) {
          const section = layout.sections[sortOrder];
          const sectionCells = layout.cells.filter((c) => c.sectionId === section.id);

          // ✅ FIX 2: Include ALL required fields: color + seat_type
          const { data: sectionData, error: sectionError } = await supabase
            .from('seating_sections')
            .insert({
              event_id: event.id,
              name: section.name,
              label: section.name,
              color: section.color || '#c9a84c',
              seat_type: 'regular',
              capacity: sectionCells.length,
              price_override: section.price,
              sort_order: sortOrder,
            })
            .select()
            .single();

          if (sectionError) throw sectionError;

          // Group cells by Y row
          const yCoords = Array.from(new Set(sectionCells.map((c) => c.y))).sort((a, b) => a - b);

          let rowIndex = 1;
          for (const y of yCoords) {
            const rowLabel = String.fromCharCode(64 + rowIndex); // A, B, C…

            const { data: rowData, error: rowError } = await supabase
              .from('seating_rows')
              .insert({
                section_id: sectionData.id,
                event_id: event.id,
                label: rowLabel,
                sort_order: rowIndex,
              })
              .select()
              .single();

            if (rowError) throw rowError;

            const rowCells = sectionCells.filter((c) => c.y === y).sort((a, b) => a.x - b.x);

            const seatsPayload = rowCells.map((_, s) => ({
              event_id: event.id,
              section_id: sectionData.id,
              row_id: rowData.id,
              label: `${rowLabel}${s + 1}`,
              row_label: rowLabel,
              seat_number: `${s + 1}`,
              seat_type: 'regular' as const,
              status: 'available' as const,
              price: section.price,
            }));

            if (seatsPayload.length > 0) {
              const { error: seatsError } = await supabase.from('seats').insert(seatsPayload);
              if (seatsError) throw seatsError;
            }

            rowIndex++;
          }
        }
      }

      setEventSlug(slugToUse);
      setPublished(true);
      toast.success('🎉 Event published successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('Publish error:', err);
      toast.error(msg || 'Failed to publish event. Check console for details.');
    } finally {
      setPublishing(false);
    }
  };

  // ── Published success screen ─────────────────────────────────────
  if (published) {
    const liveUrl = `${SITE_URL}/event/${eventSlug}`;
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Event Published! 🎉</h2>
        <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
          Your event is live. Share the link below so customers can book tickets.
        </p>

        {/* Copyable link */}
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-6 max-w-lg mx-auto">
          <span className="flex-1 text-sm font-mono text-neutral-800 truncate text-left">{liveUrl}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(liveUrl); toast.success('Link copied!'); }}
            className="p-2 text-neutral-400 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors shrink-0"
            title="Copy link"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-neutral-400 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors shrink-0"
            title="Open event page"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={liveUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" icon={<ExternalLink className="w-4 h-4" />}>
              View Event Page
            </Button>
          </a>
          <Button onClick={() => navigate('/organizer/events')}>
            Go to My Events
          </Button>
        </div>
      </div>
    );
  }

  // ── Pre-publish checklist ────────────────────────────────────────
  const checks = [
    { label: 'Event name', value: data.title, done: !!data.title },
    { label: 'Event type', value: data.event_type, done: !!data.event_type },
    { label: 'Date & time', value: data.start_date ? `${data.start_date} — ${data.end_date}` : '', done: !!data.start_date && !!data.end_date },
    { label: 'Location / Venue', value: data.venue_type, done: true },
    { label: 'Seating type', value: data.seating_type, done: !!data.seating_type },
    {
      label: 'Ticket types',
      value: data.ticket_types.map((t) => `${t.name} (${formatCurrency(t.price, data.currency)} × ${t.quantity})`).join(', '),
      done: data.ticket_types.length > 0 && data.ticket_types.every((t) => t.name && t.quantity > 0),
    },
    { label: 'Contact email', value: data.contact_email, done: !!data.contact_email },
  ];

  const allDone = checks.every((c) => c.done);
  const blockerMissing = !data.title || !data.event_type || !data.start_date || !data.end_date || !data.contact_email;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Publish Your Event</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Review your event details then go live. Customers will be able to book immediately.
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-2 mb-6">
        {checks.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              item.done ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}
          >
            {item.done ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="text-sm font-medium text-neutral-700">{item.label}</span>
            <span className="ml-auto text-xs text-neutral-500 truncate max-w-[240px] text-right">
              {item.value || <span className="text-red-500">Missing</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Ticket summary */}
      {data.ticket_types.length > 0 && (
        <div className="mb-6 p-4 bg-brand-50 border border-brand-200 rounded-xl">
          <p className="text-xs font-semibold text-brand-800 uppercase tracking-wider mb-2">
            Ticket Summary
          </p>
          <div className="space-y-1">
            {data.ticket_types.map((t, i) => (
              <div key={i} className="flex justify-between text-sm text-brand-700">
                <span>{t.name || `Ticket ${i + 1}`}</span>
                <span className="font-semibold">
                  {formatCurrency(t.price, data.currency)} × {t.quantity} ={' '}
                  {formatCurrency(t.price * t.quantity, data.currency)}
                </span>
              </div>
            ))}
            <div className="border-t border-brand-200 pt-1.5 flex justify-between text-sm font-bold text-brand-900 mt-1.5">
              <span>Total capacity</span>
              <span>{data.ticket_types.reduce((s, t) => s + t.quantity, 0)} seats</span>
            </div>
          </div>
        </div>
      )}

      {/* URL Preview */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl mb-6">
        <p className="text-xs font-medium text-neutral-500 mb-1">Your event URL will be:</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-mono text-neutral-900 break-all flex-1">{previewUrl}</p>
          <button
            onClick={() => { navigator.clipboard.writeText(previewUrl); toast.success('URL copied!'); }}
            className="p-1.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!allDone && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            Some required fields are missing. Please go back and complete them before publishing.
          </p>
        </div>
      )}

      <Button
        fullWidth
        size="lg"
        onClick={handlePublish}
        loading={publishing}
        disabled={blockerMissing || publishing}
        icon={<Rocket className="w-4 h-4" />}
        iconPosition="right"
      >
        {publishing ? 'Publishing…' : 'Publish Event'}
      </Button>

      <p className="mt-3 text-center text-xs text-neutral-400">
        You can edit all event details after publishing from your dashboard.
      </p>
    </div>
  );
}
