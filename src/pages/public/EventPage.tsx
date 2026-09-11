import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { SITE_URL } from '@/utils';

import {
  Calendar, MapPin, Clock, Users, Globe, Share2,
  CheckCircle2, Building2, ExternalLink, ArrowRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils';
import { cn } from '@/utils';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


// Mock removed in favor of live query

export default function EventPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from('events')
        .select('*, event_locations(*), ticket_types(*)')
        .eq('slug', slug)
        .single();
      
      if (data) {
        // We fetch speakers and schedule
        const [{ data: speakers }, { data: schedule }] = await Promise.all([
          supabase.from('event_speakers').select('*').eq('event_id', data.id).order('sort_order'),
          supabase.from('event_schedules').select('*').eq('event_id', data.id).order('sort_order')
        ]);

        setEvent({
          ...data,
          location: data.event_locations || {},
          ticket_types: data.ticket_types || [],
          schedule: schedule || [],
          speakers: speakers || []
        });
      }
      setLoading(false);
    };
    fetchEvent();
  }, [slug]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [, setBookingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'schedule' | 'speakers' | 'tickets' | 'venue'>('about');

  const totalAmount = event?.ticket_types?.reduce((sum: number, t: any) => sum + t.price * (quantities[t.id] || 0), 0) || 0;
  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${SITE_URL}/event/${event.slug}`);
  };

  if (loading) return <div className="min-h-screen bg-white pt-24 text-center">Loading event...</div>;
  if (!event) return <div className="min-h-screen bg-white pt-24 text-center">Event not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-16">
        {/* Hero */}
        <div className="relative h-80 sm:h-[420px] overflow-hidden bg-neutral-900">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />

          {/* Share button */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium rounded-lg hover:bg-white/20 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>

          {/* Event title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="primary" className="capitalize">{event.event_type}</Badge>
                {event.status === 'published' && <Badge variant="success" dot>Published</Badge>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{event.title}</h1>
              <p className="mt-2 text-neutral-300 text-sm sm:text-base max-w-2xl">{event.short_description}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Event Info */}
            <div className="lg:col-span-2">
              {/* Quick info bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                  { icon: Calendar, label: 'Date', value: new Date(event.start_date).toLocaleDateString() },
                  { icon: Clock, label: 'Time', value: event.start_time },
                  { icon: MapPin, label: 'Venue', value: event.venue_type === 'online' ? 'Online' : (event.location.city || 'TBD') },
                  { icon: Users, label: 'Capacity', value: event.max_capacity ? `${event.max_capacity} max` : 'Unlimited' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <item.icon className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-500">{item.label}</p>
                      <p className="text-sm font-semibold text-neutral-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tab navigation */}
              <div className="flex gap-1 border-b border-neutral-200 mb-6 overflow-x-auto">
                {(['about', 'schedule', 'speakers', 'tickets', 'venue'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px capitalize whitespace-nowrap transition-colors',
                      activeTab === tab
                        ? 'border-brand-500 text-brand-600'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* About */}
              {activeTab === 'about' && (
                <div className="prose prose-sm max-w-none text-neutral-700 leading-relaxed">
                  <p className="whitespace-pre-line">{event.description}</p>

                  {/* Organizer */}
                  <div className="mt-8 p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold uppercase">
                      {event.organizer_name ? event.organizer_name.substring(0, 2) : 'EV'}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Organized by</p>
                      <p className="font-semibold text-neutral-900">{event.organizer_name}</p>
                    </div>
                    <a href={`mailto:${event.contact_email || 'hello@avelora.com'}`} className="ml-auto text-sm text-brand-600 hover:text-brand-700 font-medium">
                      Contact Organizer
                    </a>
                  </div>
                </div>
              )}

              {/* Schedule */}
              {activeTab === 'schedule' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Day 1 — {new Date(event.start_date).toLocaleDateString()}</p>
                  {event.schedule?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors">
                      <div className="w-14 shrink-0">
                        <span className="text-sm font-bold text-brand-600">
                          {item.start_time.substring(0, 5)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-brand-600 mt-0.5">{item.description}</p>
                        )}
                        {item.location && (
                          <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {item.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Speakers */}
              {activeTab === 'speakers' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers?.map((speaker: any) => (
                    <div key={speaker.id} className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-xl hover:shadow-sm transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-semibold text-sm shrink-0 overflow-hidden">
                        {speaker.avatar_url?.length <= 3 ? speaker.avatar_url : 'SP'}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">{speaker.name}</p>
                        <p className="text-xs text-neutral-500">{speaker.title}</p>
                        <p className="text-xs text-brand-600">{speaker.organization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tickets (tab view) */}
              {activeTab === 'tickets' && (
                <div className="space-y-3">
                  {event.ticket_types?.length === 0 ? (
                    <p className="text-neutral-500">No tickets available.</p>
                  ) : event.ticket_types.map((t: any) => {
                    const remaining = t.quantity - (t.quantity_sold || 0);
                    const pct = Math.round(((t.quantity_sold || 0) / t.quantity) * 100);
                    return (
                      <div key={t.id} className="p-5 border border-neutral-200 rounded-xl hover:border-brand-200 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-neutral-900">{t.name}</h4>
                            <p className="text-sm text-neutral-500 mt-0.5">{t.description}</p>
                          </div>
                          <p className="text-xl font-bold text-neutral-900 shrink-0 ml-4">
                            {formatCurrency(t.price, event.currency)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 flex-1 mr-4">
                            <div className="flex-1 bg-neutral-100 rounded-full h-1.5">
                              <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-neutral-500 shrink-0">{remaining} left</span>
                          </div>
                          {event.seating_type === 'reserved' ? (
                            <Link to={`/event/${event.slug}/book`} state={{ event }}>
                              <Button size="sm">Select Seats</Button>
                            </Link>
                          ) : (
                            <Button size="sm" onClick={() => setBookingOpen(true)}>
                              Book Now
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Venue */}
              {activeTab === 'venue' && (
                <div>
                  <div className="p-5 border border-neutral-200 rounded-xl mb-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-neutral-900">{event.location.venue_name}</h4>
                        <p className="text-sm text-neutral-500 mt-0.5">
                          {event.location.address}, {event.location.city}, {event.location.state}
                        </p>
                        <p className="text-sm text-neutral-500">{event.location.country}</p>
                        <a
                          href={event.location.latitude && event.location.longitude ? 
                            `https://www.google.com/maps/dir/?api=1&destination=${event.location.latitude},${event.location.longitude}` 
                            : `https://maps.google.com/?q=${encodeURIComponent(event.location.venue_name + ', ' + event.location.city)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                        >
                          <Globe className="w-3.5 h-3.5" /> Get Directions
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* Map */}
                  {event.location.latitude && event.location.longitude ? (
                    <div className="h-64 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 relative z-0">
                      <MapContainer 
                        center={[event.location.latitude, event.location.longitude]} 
                        zoom={15} 
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[event.location.latitude, event.location.longitude]} />
                      </MapContainer>
                    </div>
                  ) : (
                    <div className="h-48 bg-neutral-100 rounded-xl flex items-center justify-center border border-neutral-200">
                      <p className="text-sm text-neutral-400">Map unavailable</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Booking Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
                  <h3 className="font-semibold text-neutral-900 mb-4">Select Tickets</h3>

                  {event.seating_type === 'reserved' ? (
                    <div className="space-y-4">
                      <p className="text-sm text-neutral-500 mb-4">
                        This event uses reserved seating. You can choose your exact seats on the interactive map.
                      </p>
                      <Link to={`/event/${event.slug}/book`} state={{ event }}>
                        <Button
                          fullWidth
                          size="lg"
                          icon={<ArrowRight className="w-4 h-4" />}
                          iconPosition="right"
                        >
                          Select Seats on Map
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-5">
                        {event.ticket_types?.map((t: any) => {
                          const remaining = t.quantity - (t.quantity_sold || 0);
                          const qty = quantities[t.id] || 0;
                          return (
                            <div key={t.id} className="p-3 border border-neutral-200 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-neutral-900">{t.name}</span>
                                <span className="text-sm font-bold text-neutral-900">
                                  {formatCurrency(t.price, event.currency)}
                                </span>
                              </div>
                              {remaining <= 20 && (
                                <p className="text-xs text-orange-600 mb-2">Only {remaining} left!</p>
                              )}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setQuantities(prev => ({ ...prev, [t.id]: Math.max(0, (prev[t.id] || 0) - 1) }))}
                                  className="w-7 h-7 rounded-md border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors"
                                  disabled={qty === 0}
                                >
                                  −
                                </button>
                                <span className="w-6 text-center text-sm font-medium">{qty}</span>
                                <button
                                  onClick={() => setQuantities(prev => ({ ...prev, [t.id]: Math.min(remaining, (prev[t.id] || 0) + 1) }))}
                                  className="w-7 h-7 rounded-md border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors"
                                  disabled={qty >= remaining}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total */}
                      {totalTickets > 0 && (
                        <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</span>
                            <span className="font-bold text-neutral-900">{formatCurrency(totalAmount, event.currency)}</span>
                          </div>
                        </div>
                      )}

                      <Link to={`/event/${event.slug}/book`} state={{ quantities, event }}>
                        <Button
                          fullWidth
                          size="lg"
                          disabled={totalTickets === 0}
                          icon={<ArrowRight className="w-4 h-4" />}
                          iconPosition="right"
                        >
                          {totalTickets === 0 ? 'Select Tickets' : 'Continue to Booking'}
                        </Button>
                      </Link>
                    </>
                  )}

                  <div className="mt-4 space-y-2">
                    {['Instant booking confirmation', 'Secure payment', 'Digital tickets delivered by email'].map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs text-neutral-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event contact */}
                <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <p className="text-xs font-medium text-neutral-500 mb-1">Questions?</p>
                  <p className="text-sm text-neutral-700">
                    Contact: <a href={`mailto:${event.contact_email || 'hello@avelora.com'}`} className="text-brand-600 hover:underline">{event.contact_email || 'hello@avelora.com'}</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
