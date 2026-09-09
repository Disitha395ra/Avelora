import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  ArrowRight, Calendar, MapPin, Users, BarChart3, Ticket, Share2,
  Globe, Star, CheckCircle2, ChevronRight, Mic2, BookOpen, Building2,
  Music, Briefcase, GraduationCap, Trophy, Layers, Heart, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

// Removed mock events in favor of live query

const categories = [
  { label: 'Concerts', icon: Music, href: '/discover?type=concert', color: 'bg-rose-50 text-rose-600' },
  { label: 'Conferences', icon: Mic2, href: '/discover?type=conference', color: 'bg-blue-50 text-blue-600' },
  { label: 'Symposiums', icon: BookOpen, href: '/discover?type=symposium', color: 'bg-violet-50 text-violet-600' },
  { label: 'Workshops', icon: Layers, href: '/discover?type=workshop', color: 'bg-amber-50 text-amber-600' },
  { label: 'Corporate', icon: Briefcase, href: '/discover?type=corporate', color: 'bg-slate-50 text-slate-600' },
  { label: 'Exhibitions', icon: Building2, href: '/discover?type=exhibition', color: 'bg-emerald-50 text-emerald-600' },
  { label: 'University', icon: GraduationCap, href: '/discover?type=university', color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Community', icon: Heart, href: '/discover?type=community', color: 'bg-pink-50 text-pink-600' },
];

const howItWorks = [
  {
    step: '01',
    icon: Calendar,
    title: 'Create',
    description: 'Set up your event in minutes using our guided wizard. Add details, speakers, and schedule.',
  },
  {
    step: '02',
    icon: Ticket,
    title: 'Configure',
    description: 'Build your seating map, define ticket types, set pricing, and establish capacity.',
  },
  {
    step: '03',
    icon: Share2,
    title: 'Share',
    description: 'Get your unique event URL. Share it anywhere — social media, email, or embed it.',
  },
  {
    step: '04',
    icon: Users,
    title: 'Collect',
    description: 'Receive bookings and secure payments. Attendees get instant confirmation and tickets.',
  },
  {
    step: '05',
    icon: BarChart3,
    title: 'Manage',
    description: 'Monitor attendance, track revenue, and manage your event from a powerful dashboard.',
  },
  {
    step: '06',
    icon: Star,
    title: 'Experience',
    description: 'Deliver exceptional events with check-in tools, real-time analytics, and post-event reports.',
  },
];

const whyAvelora = [
  { title: 'Global Reach', description: 'Multi-currency, multi-timezone support for events across 190+ countries.', icon: Globe },
  { title: 'Any Event Type', description: 'From intimate workshops to 50,000-seat concerts — Avelora handles it all.', icon: Zap },
  { title: 'Enterprise Security', description: 'Bank-grade encryption, RLS policies, and SOC 2-compliant infrastructure.', icon: CheckCircle2 },
  { title: 'Powerful Analytics', description: 'Real-time revenue dashboards, ticket analytics, and post-event reports.', icon: BarChart3 },
  { title: 'Private Events', description: 'Password-protected events and private URLs for exclusive access control.', icon: Trophy },
  { title: 'Smart Check-in', description: 'QR code scanning and real-time attendance tracking for your event staff.', icon: CheckCircle2 },
];

const testimonials = [
  {
    quote: "Avelora transformed how we run our annual conference. The seating builder alone saved us 20+ hours of coordination.",
    name: 'Dr. Sarah Mitchell',
    title: 'Conference Director, IEEE Asia',
    avatar: 'SM',
  },
  {
    quote: "We moved our entire concert ticket operation to Avelora. The booking experience is just as premium as the event itself.",
    name: 'James Okafor',
    title: 'Events Lead, Rhythm Productions',
    avatar: 'JO',
  },
  {
    quote: "Setting up our university symposium took under an hour. The attendees loved the professional registration experience.",
    name: 'Prof. Ananda Perera',
    title: 'Dean of Research, University of Colombo',
    avatar: 'AP',
  },
];

const stats = [
  { value: '50K+', label: 'Events Created' },
  { value: '2.4M+', label: 'Tickets Sold' },
  { value: '190+', label: 'Countries' },
  { value: '98%', label: 'Satisfaction Rate' },
];

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*, event_locations(city, country), ticket_types(price)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(4);
      if (data) setFeaturedEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ---- HERO ---- */}
      <section className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span className="text-xs font-medium text-brand-700">
                The Global Event Infrastructure Platform
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight mb-6">
              Where Experiences
              <br />
              <span className="text-brand-600">Come Together</span>
            </h1>

            <p className="text-xl text-neutral-500 leading-relaxed mb-10 max-w-2xl mx-auto">
              Create, manage, and experience events — all in one place. From intimate seminars to 
              50,000-seat concerts, Avelora powers events across the globe.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/organizer/events/create">
                <Button size="lg" variant="primary" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Create an Event
                </Button>
              </Link>
              <Link to="/discover">
                <Button size="lg" variant="outline">
                  Explore Events
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-xs text-neutral-400">
              No setup fees · Free to create · Pay only when you sell
            </p>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&auto=format&fit=crop&q=85"
                alt="Avelora platform preview — FutureTech Summit event page"
                className="w-full h-[420px] object-cover object-center"
              />
              {/* Overlay card */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:bottom-8 sm:w-72 bg-white border border-neutral-200 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm shrink-0">FT</div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">FutureTech Summit 2026</p>
                    <p className="text-xs text-neutral-500">Mar 12–14 · San Francisco</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-neutral-50 rounded-lg p-2">
                    <p className="text-sm font-bold text-neutral-900">2,400</p>
                    <p className="text-xs text-neutral-500">Attendees</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-2">
                    <p className="text-sm font-bold text-brand-600">94%</p>
                    <p className="text-xs text-neutral-500">Sold</p>
                  </div>
                  <div className="bg-brand-500 rounded-lg p-2">
                    <p className="text-sm font-bold text-white">Book</p>
                    <p className="text-xs text-brand-100">→</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- STATS ---- */}
      <section className="py-12 border-y border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-neutral-900">{s.value}</p>
                <p className="text-sm text-neutral-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-4xl font-bold text-neutral-900">From idea to sold-out event</h2>
            <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto">
              A streamlined process that puts you in control of every aspect of your event.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="relative p-6 bg-white border border-neutral-200 rounded-xl hover:border-brand-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <span className="text-xs font-bold text-neutral-300 tracking-widest">{step.step}</span>
                    <div className="mt-1 w-10 h-10 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-center group-hover:bg-brand-50 group-hover:border-brand-200 transition-colors">
                      <step.icon className="w-5 h-5 text-neutral-500 group-hover:text-brand-600 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CATEGORIES ---- */}
      <section className="py-20 px-4 sm:px-6 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">Event Types</p>
              <h2 className="text-4xl font-bold text-neutral-900">Every event, one platform</h2>
            </div>
            <Link to="/discover" className="mt-4 sm:mt-0 flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              Browse all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.href}
                className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-sm transition-all duration-150 group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color} shrink-0`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-neutral-900">{cat.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 ml-auto group-hover:text-neutral-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FEATURED EVENTS ---- */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">Upcoming Events</p>
              <h2 className="text-4xl font-bold text-neutral-900">Featured experiences</h2>
            </div>
            <Link to="/discover" className="mt-4 sm:mt-0 flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all events <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredEvents.map((event) => {
              const location = event.event_locations ? `${event.event_locations.city || ''}, ${event.event_locations.country || ''}` : 'Online';
              const minPrice = event.ticket_types?.length 
                ? Math.min(...event.ticket_types.map((t: any) => t.price))
                : 0;
              const priceDisplay = minPrice === 0 ? 'Free' : `From ${event.currency || '$'}${minPrice}`;
              
              return (
              <Link
                key={event.id}
                to={`/event/${event.slug}`}
                className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all duration-200"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      {event.event_type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 text-sm leading-snug mb-2 group-hover:text-brand-600 transition-colors">
                    {event.title}
                  </h3>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {new Date(event.start_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {location.replace(/^, | , $/g, '') || 'Online'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      {event.max_capacity || 'Unlimited'} capacity
                    </div>
                  </div>
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-900">{priceDisplay}</span>
                    <span className="text-xs text-brand-600 font-medium group-hover:underline">Book Now →</span>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        </div>
      </section>

      {/* ---- WHY AVELORA ---- */}
      <section className="py-20 px-4 sm:px-6 bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-3">Why Avelora</p>
            <h2 className="text-4xl font-bold text-white">Built for serious event organizers</h2>
            <p className="mt-4 text-lg text-neutral-400 max-w-xl mx-auto">
              Avelora isn't just a ticket-selling website. It's a complete event infrastructure platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whyAvelora.map((item) => (
              <div
                key={item.title}
                className="p-6 bg-neutral-800 border border-neutral-700 rounded-xl hover:border-neutral-600 transition-colors"
              >
                <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- TESTIMONIALS ---- */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-4xl font-bold text-neutral-900">Loved by organizers worldwide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-400 text-brand-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
                    <p className="text-xs text-neutral-500">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="py-20 px-4 sm:px-6 bg-brand-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Your next experience starts here.
          </h2>
          <p className="text-lg text-brand-100 mb-10">
            Join thousands of organizers who trust Avelora to power their events.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Start for Free
              </Button>
            </Link>
            <Link to="/discover">
              <Button
                size="lg"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Explore Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
