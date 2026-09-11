import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  ArrowRight, Calendar, MapPin, Users, BarChart3, Ticket, Share2,
  Globe, Star, CheckCircle2, Mic2, BookOpen, Building2,
  Music, Briefcase, GraduationCap, Heart, Layers, Zap, ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatCurrency } from '@/utils';

const categories = [
  { label: 'Concerts & Music', icon: Music, href: '/discover?type=concert', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  { label: 'Conferences', icon: Mic2, href: '/discover?type=conference', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  { label: 'Symposiums', icon: BookOpen, href: '/discover?type=symposium', bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
  { label: 'Workshops', icon: Layers, href: '/discover?type=workshop', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  { label: 'Corporate', icon: Briefcase, href: '/discover?type=corporate', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' },
  { label: 'Exhibitions', icon: Building2, href: '/discover?type=exhibition', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  { label: 'University', icon: GraduationCap, href: '/discover?type=university', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  { label: 'Community', icon: Heart, href: '/discover?type=community', bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
];

const howItWorks = [
  { step: '01', icon: Calendar, title: 'Create', description: 'Set up your event in minutes using our guided wizard. Add details, speakers, and schedule.' },
  { step: '02', icon: Ticket, title: 'Configure', description: 'Design your seating map, define ticket tiers, set pricing, and establish capacity limits.' },
  { step: '03', icon: Share2, title: 'Share', description: 'Receive a unique event URL. Share it via email, social media, or embed on your website.' },
  { step: '04', icon: Users, title: 'Collect', description: 'Receive bookings and secure payments. Attendees get instant confirmation and digital tickets.' },
  { step: '05', icon: BarChart3, title: 'Manage', description: 'Track revenue, monitor attendance, and manage your event from a powerful organizer dashboard.' },
  { step: '06', icon: Star, title: 'Experience', description: 'Deliver exceptional events with real-time analytics, check-in tools, and post-event reports.' },
];

const whyAvelora = [
  { title: 'Global Reach', description: 'Multi-currency, multi-timezone support for events across 190+ countries.', icon: Globe },
  { title: 'Any Event Size', description: 'From intimate workshops to 50,000-seat concerts — Avelora handles it all.', icon: Zap },
  { title: 'Enterprise Security', description: 'Bank-grade encryption, RLS policies, and SOC 2-compliant infrastructure.', icon: CheckCircle2 },
  { title: 'Powerful Analytics', description: 'Real-time revenue dashboards, ticket analytics, and post-event reports.', icon: BarChart3 },
  { title: 'Private Events', description: 'Password-protected events and private URLs for exclusive access control.', icon: Star },
  { title: 'Smart Check-in', description: 'QR code scanning and real-time attendance tracking for event staff.', icon: CheckCircle2 },
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
    quote: "Setting up our university symposium took under an hour. Attendees loved the professional registration experience.",
    name: 'Prof. Ananda Perera',
    title: 'Dean of Research, University of Colombo',
    avatar: 'AP',
  },
];

const stats = [
  { value: '50K+', label: 'Events Created' },
  { value: '2.4M+', label: 'Tickets Sold' },
  { value: '190+', label: 'Countries' },
  { value: '98%', label: 'Satisfaction' },
];

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
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

      {/* ─────────────────────────────────────────────────────── HERO */}
      <section className="relative pt-[68px] min-h-[85vh] flex items-center overflow-hidden bg-neutral-900">
        {/* Background image with editorial overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1800&auto=format&fit=crop&q=80"
            alt="Events"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            {/* Label */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-8 h-[2px] bg-brand-400" />
              <span className="text-brand-400 text-xs font-semibold uppercase tracking-[0.15em]">
                Global Event Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              Where Great
              <br />
              <em className="not-italic text-brand-400">Experiences</em>
              <br />
              Come Together
            </h1>

            <p className="text-lg text-neutral-300 leading-relaxed mb-10 max-w-xl">
              Create, manage, and experience events of any scale — from intimate seminars to 
              stadium concerts. Avelora powers events across the globe.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link to="/organizer/events/create">
                <button className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3.5 rounded-lg transition-colors shadow-lg text-sm">
                  Create Your Event <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/discover">
                <button className="flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-medium px-7 py-3.5 rounded-lg transition-colors text-sm">
                  Explore Events <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            <p className="mt-5 text-xs text-neutral-500">
              No setup fees · Free to create · Pay only when you sell
            </p>
          </div>
        </div>

        {/* Floating stat card */}
        <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4 text-center w-36">
              <p className="font-serif text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-neutral-300 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────── CATEGORIES */}
      <section className="py-16 px-5 sm:px-8 bg-neutral-50 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-1">Browse By</p>
              <h2 className="font-serif text-3xl text-neutral-900">Event Categories</h2>
            </div>
            <Link to="/discover" className="hidden sm:flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-brand-600 transition-colors">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                to={cat.href}
                className={`group flex flex-col items-center gap-2.5 p-4 rounded-xl border ${cat.border} ${cat.bg} hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 text-center`}
              >
                <cat.icon className={`w-5 h-5 ${cat.text}`} />
                <span className={`text-xs font-semibold ${cat.text} leading-tight`}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────── FEATURED EVENTS */}
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-1">Live Now</p>
              <h2 className="font-serif text-3xl text-neutral-900">Featured Events</h2>
            </div>
            <Link to="/discover" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              View all events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredEvents.map((event: any, i: number) => {
                const location = event.event_locations?.[0] || event.event_locations;
                const minPrice = event.ticket_types?.length > 0
                  ? Math.min(...event.ticket_types.map((t: any) => t.price))
                  : 0;
                return (
                  <Link
                    key={event.id}
                    to={`/event/${event.slug}`}
                    className="group block card-lift rounded-xl overflow-hidden border border-neutral-200 bg-white"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                      <img
                        src={event.cover_image_url || PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length]}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-block bg-white/90 backdrop-blur-sm text-neutral-800 text-[11px] font-semibold px-2.5 py-1 rounded-md capitalize">
                          {event.event_type?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif font-bold text-neutral-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-brand-700 transition-colors">
                        {event.title}
                      </h3>
                      <div className="space-y-1 mb-3">
                        <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 shrink-0" />
                          {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {location?.city && (
                          <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {location.city}{location.country ? `, ${location.country}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        <span className="text-sm font-bold text-neutral-900">
                          {minPrice === 0 ? 'Free' : `From ${formatCurrency(minPrice, event.currency)}`}
                        </span>
                        <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                          Book <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PLACEHOLDER_IMAGES.map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-neutral-200 bg-white animate-pulse">
                  <div className="aspect-[4/3] bg-neutral-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-neutral-100 rounded w-3/4" />
                    <div className="h-3 bg-neutral-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────── HOW IT WORKS */}
      <section className="py-20 px-5 sm:px-8 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-2">Simple Process</p>
            <h2 className="font-serif text-4xl text-white mb-4">From Idea to Sold Out</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Six simple steps from creating your event to delivering an unforgettable experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorks.map((step) => (
              <div key={step.step} className="relative p-6 border border-white/10 rounded-xl bg-white/5 hover:bg-white/8 transition-colors group">
                {/* Step number - large background */}
                <div className="absolute top-4 right-5 font-serif text-5xl font-bold text-white/5 select-none group-hover:text-white/8 transition-colors">
                  {step.step}
                </div>
                <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-serif text-lg text-white font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/organizer/events/create">
              <button className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors text-sm">
                Start for Free <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────── WHY AVELORA */}
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&auto=format&fit=crop&q=80"
                alt="Event management dashboard"
                className="rounded-2xl w-full aspect-[4/3] object-cover shadow-2xl"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-5 bg-white border border-neutral-200 shadow-xl rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-serif font-bold text-neutral-900 text-lg">2.4M+</p>
                  <p className="text-xs text-neutral-500">Tickets Sold Globally</p>
                </div>
              </div>
            </div>

            {/* Right: features */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">Why Avelora</p>
              <h2 className="font-serif text-4xl text-neutral-900 mb-4 leading-tight">
                Built for Every
                <br />Event, Every Scale
              </h2>
              <p className="text-neutral-500 mb-10 leading-relaxed">
                Whether you're organizing a small workshop or a city-wide festival, 
                Avelora gives you enterprise-grade tools with simplicity in mind.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {whyAvelora.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 text-sm mb-0.5">{item.title}</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────── TESTIMONIALS */}
      <section className="py-20 px-5 sm:px-8 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">Real Organizers</p>
            <h2 className="font-serif text-4xl text-neutral-900">What They're Saying</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white border border-neutral-200 rounded-2xl p-7 flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="font-serif text-base text-neutral-700 leading-relaxed mb-6 flex-1 italic">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
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

      {/* ─────────────────────────────────────────────── CTA */}
      <section className="py-24 px-5 sm:px-8 bg-brand-600 relative overflow-hidden">
        {/* Subtle geometric background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <p className="text-brand-200 text-xs font-semibold uppercase tracking-widest mb-3">Get Started Today</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white font-bold mb-5 leading-tight">
            Your Next Great Event
            <br />Starts Here
          </h2>
          <p className="text-brand-100 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of organizers who trust Avelora to power their events worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <button className="bg-white text-brand-700 font-bold px-8 py-3.5 rounded-lg hover:bg-neutral-100 transition-colors text-sm shadow-lg">
                Create Free Account
              </button>
            </Link>
            <Link to="/discover">
              <button className="border border-white/40 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors text-sm">
                Browse Events
              </button>
            </Link>
          </div>
          <p className="text-brand-200 text-xs mt-6">No credit card required · 5-minute setup</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
