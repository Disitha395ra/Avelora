import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Search, MapPin, Calendar, SlidersHorizontal, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils';

const EVENT_TYPES = [
  'All', 'Concert', 'Conference', 'Symposium', 'Workshop',
  'Seminar', 'Corporate', 'Exhibition', 'Networking', 'University', 'Community',
];

// MOCK_EVENTS removed in favor of live query


export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*, event_locations(city, country), ticket_types(price)')
        .eq('status', 'published')
        .order('start_date', { ascending: true });
      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filtered = events.filter((e) => {
    const locationStr = e.event_locations ? `${e.event_locations.city || ''} ${e.event_locations.country || ''}` : '';
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      locationStr.toLowerCase().includes(search.toLowerCase()) ||
      (e.organizer_name || '').toLowerCase().includes(search.toLowerCase());
      
    // Case-insensitive type matching
    const matchType = activeType === 'All' || e.event_type.toLowerCase() === activeType.toLowerCase();
    
    // Check if free
    const isFree = e.ticket_types?.length ? Math.min(...e.ticket_types.map((t: any) => t.price)) === 0 : false;
    const matchFree = !freeOnly || isFree;
    
    return matchSearch && matchType && matchFree;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-16">
        {/* Header */}
        <div className="bg-neutral-50 border-b border-neutral-200 py-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-neutral-900 mb-1">Discover Events</h1>
            <p className="text-neutral-500 mb-6">Find your next experience — anywhere in the world.</p>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search events, organizers, cities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button
                variant="outline"
                icon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
                {(freeOnly) && (
                  <span className="ml-1 w-4 h-4 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center">1</span>
                )}
              </Button>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-white border border-neutral-200 rounded-xl flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={freeOnly}
                    onChange={(e) => setFreeOnly(e.target.checked)}
                    className="w-4 h-4 accent-brand-500"
                  />
                  <span className="text-neutral-700 font-medium">Free events only</span>
                </label>
                <button
                  onClick={() => { setFreeOnly(false); setShowFilters(false); }}
                  className="ml-auto text-xs text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Type tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
            {EVENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={cn(
                  'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border',
                  activeType === type
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                )}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-sm text-neutral-500 mb-6">
            {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
            {search && ` for "${search}"`}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-neutral-500">Loading events...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-neutral-300" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">No events found</h3>
              <p className="text-sm text-neutral-500 mt-1.5">Try adjusting your search or filters</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setActiveType('All'); setFreeOnly(false); }}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((event) => {
                const location = event.event_locations ? `${event.event_locations.city || ''}, ${event.event_locations.country || ''}` : 'Online';
                const minPrice = event.ticket_types?.length 
                  ? Math.min(...event.ticket_types.map((t: any) => t.price))
                  : 0;
                const isFree = minPrice === 0;
                const priceDisplay = isFree ? 'Free' : `From ${event.currency || '$'}${minPrice}`;
                
                return (
                <Link
                  key={event.id}
                  to={`/event/${event.slug}`}
                  className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all duration-200"
                >
                  <div className="relative h-44 overflow-hidden bg-neutral-100">
                    <img
                      src={event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isFree && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="success">Free</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full capitalize">
                      {event.event_type}
                    </span>
                    <h3 className="mt-2 font-semibold text-neutral-900 text-sm leading-snug group-hover:text-brand-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Calendar className="w-3.5 h-3.5 shrink-0" /> {new Date(event.start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0" /> {location.replace(/^, | , $/g, '') || 'Online'}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-neutral-900">{priceDisplay}</span>
                      <div className="w-24 bg-neutral-100 rounded-full h-1.5">
                        <div
                          className="bg-brand-500 h-1.5 rounded-full"
                          style={{ width: `${event.max_capacity ? Math.round((0 / event.max_capacity) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              )})}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
