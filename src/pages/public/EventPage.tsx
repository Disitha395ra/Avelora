import { useState } from 'react';
import { Link } from 'react-router-dom';

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


// Mock event — replace with Supabase query
const MOCK_EVENT = {
  id: '1',
  slug: 'futuretech-summit-2026',
  title: 'FutureTech Summit 2026',
  type: 'Conference',
  status: 'published',
  short_description: 'The premier technology leadership conference bringing together 2,400+ innovators across AI, Web3, and the future of work.',
  description: `FutureTech Summit 2026 is the definitive technology conference for visionary leaders, engineers, and entrepreneurs. Over three transformative days in San Francisco, you'll engage with world-class speakers, explore cutting-edge technologies, and build meaningful connections with the global tech community.

This year's theme — **Intelligence at Scale** — will examine how artificial intelligence, distributed computing, and exponential technologies are reshaping industries, societies, and the very nature of work itself.

Whether you're a seasoned CTO, an ambitious startup founder, or a curious technologist, FutureTech Summit 2026 offers an unparalleled opportunity to shape your thinking, expand your network, and accelerate your impact.`,
  start_date: '2026-03-12',
  end_date: '2026-03-14',
  start_time: '09:00',
  end_time: '18:00',
  timezone: 'America/Los_Angeles',
  cover_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&auto=format&fit=crop&q=85',
  organizer_name: 'TechVentures Inc.',
  organizer_logo: 'TV',
  currency: 'USD',
  venue_type: 'physical',
  location: {
    venue_name: 'Moscone Center',
    address: '747 Howard St',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
  },
  speakers: [
    { id: '1', name: 'Dr. Priya Sharma', title: 'Chief AI Officer', org: 'DeepMind', avatar: 'PS' },
    { id: '2', name: 'Marcus Chen', title: 'Co-Founder & CEO', org: 'Quantum Labs', avatar: 'MC' },
    { id: '3', name: 'Dr. Elena Vasquez', title: 'Professor of CS', org: 'MIT', avatar: 'EV' },
    { id: '4', name: 'James Okafor', title: 'VP Engineering', org: 'Google', avatar: 'JO' },
    { id: '5', name: 'Amara Williams', title: 'Founder', org: 'NeuralPath AI', avatar: 'AW' },
    { id: '6', name: 'Dr. Raj Patel', title: 'CTO', org: 'FutureSystems', avatar: 'RP' },
  ],
  schedule: [
    { time: '09:00', title: 'Registration & Welcome Coffee', location: 'Grand Lobby' },
    { time: '10:00', title: 'Opening Keynote: Intelligence at Scale', location: 'Main Auditorium', speaker: 'Dr. Priya Sharma' },
    { time: '11:30', title: 'Panel: The Future of AI in Enterprise', location: 'Main Auditorium' },
    { time: '13:00', title: 'Networking Lunch', location: 'Exhibition Hall' },
    { time: '14:00', title: 'Technical Session A: LLM Architectures', location: 'Hall A' },
    { time: '14:00', title: 'Technical Session B: Web3 Infrastructure', location: 'Hall B' },
    { time: '15:30', title: 'Coffee Break & Expo Floor', location: 'Exhibition Hall' },
    { time: '16:00', title: 'Fireside Chat: The VC Perspective', location: 'Main Auditorium', speaker: 'Marcus Chen' },
    { time: '17:00', title: 'Day 1 Closing Remarks', location: 'Main Auditorium' },
    { time: '18:00', title: 'Networking Reception', location: 'Rooftop Terrace' },
  ],
  ticket_types: [
    { id: '1', name: 'General', description: 'Full 3-day access to all sessions and exhibition hall.', price: 199, quantity: 1800, sold: 1650 },
    { id: '2', name: 'Professional', description: 'General access + workshops, speaker meet & greet, lunch.', price: 399, quantity: 500, sold: 430 },
    { id: '3', name: 'VIP', description: 'All access + exclusive VIP lounge, reserved seating, and post-event dinner.', price: 899, quantity: 100, sold: 85 },
  ],
};

export default function EventPage() {
  const event = MOCK_EVENT; // In production: useQuery to fetch by slug
  const [quantities, setQuantities] = useState<Record<string, number>>({ '1': 0, '2': 0, '3': 0 });
  const [, setBookingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'schedule' | 'speakers' | 'tickets' | 'venue'>('about');

  const totalAmount = event.ticket_types.reduce((sum, t) => sum + t.price * (quantities[t.id] || 0), 0);
  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

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
                <Badge variant="primary">{event.type}</Badge>
                <Badge variant="success" dot>Published</Badge>
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
                  { icon: Calendar, label: 'Date', value: 'Mar 12–14, 2026' },
                  { icon: Clock, label: 'Time', value: '9:00 AM PST' },
                  { icon: MapPin, label: 'Venue', value: event.location.city + ', ' + event.location.state },
                  { icon: Users, label: 'Attendees', value: '2,400+' },
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
                    <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                      {event.organizer_logo}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Organized by</p>
                      <p className="font-semibold text-neutral-900">{event.organizer_name}</p>
                    </div>
                    <button className="ml-auto text-sm text-brand-600 hover:text-brand-700 font-medium">
                      View Profile
                    </button>
                  </div>
                </div>
              )}

              {/* Schedule */}
              {activeTab === 'schedule' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Day 1 — March 12, 2026</p>
                  {event.schedule.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors">
                      <div className="w-14 shrink-0">
                        <span className="text-sm font-bold text-brand-600">{item.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                        {item.speaker && (
                          <p className="text-xs text-brand-600 mt-0.5">{item.speaker}</p>
                        )}
                        <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Speakers */}
              {activeTab === 'speakers' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers.map((speaker) => (
                    <div key={speaker.id} className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-xl hover:shadow-sm transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-semibold text-sm shrink-0">
                        {speaker.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">{speaker.name}</p>
                        <p className="text-xs text-neutral-500">{speaker.title}</p>
                        <p className="text-xs text-brand-600">{speaker.org}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tickets (tab view) */}
              {activeTab === 'tickets' && (
                <div className="space-y-3">
                  {event.ticket_types.map((t) => {
                    const remaining = t.quantity - t.sold;
                    const pct = Math.round((t.sold / t.quantity) * 100);
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
                          <Button size="sm" onClick={() => setBookingOpen(true)}>
                            Book Now
                          </Button>
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
                          href={`https://maps.google.com/?q=${encodeURIComponent(event.location.venue_name + ', ' + event.location.city)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                        >
                          <Globe className="w-3.5 h-3.5" /> View on Google Maps
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* Map placeholder */}
                  <div className="h-48 bg-neutral-100 rounded-xl flex items-center justify-center border border-neutral-200">
                    <p className="text-sm text-neutral-400">Interactive map loads with Google Maps API key</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Booking Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
                  <h3 className="font-semibold text-neutral-900 mb-4">Select Tickets</h3>

                  <div className="space-y-3 mb-5">
                    {event.ticket_types.map((t) => {
                      const remaining = t.quantity - t.sold;
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

                  <Link to={`/event/${event.slug}/book`}>
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
                    Contact: <a href="mailto:info@futuretech.com" className="text-brand-600 hover:underline">info@futuretech.com</a>
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
