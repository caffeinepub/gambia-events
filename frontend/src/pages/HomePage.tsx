import { useState, useMemo } from 'react';
import { useListApprovedEvents } from '../hooks/useQueries';
import EventCard from '../components/EventCard';
import CategoryPills from '../components/CategoryPills';
import FilterBar from '../components/FilterBar';
import { Skeleton } from '@/components/ui/skeleton';
import { EventCategory } from '../backend';
import { isToday, isThisWeek, isThisMonth } from '../lib/utils';
import { MapPin, Calendar, Sparkles } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  const { data: events, isLoading } = useListApprovedEvents();

  const filteredEvents = useMemo(() => {
    if (!events) return [];

    let filtered = [...events];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    // City filter
    if (selectedCity !== 'All Cities') {
      filtered = filtered.filter((e) => e.city === selectedCity);
    }

    // Date filter
    if (selectedDateRange === 'today') {
      filtered = filtered.filter((e) => isToday(e.datetime));
    } else if (selectedDateRange === 'week') {
      filtered = filtered.filter((e) => isThisWeek(e.datetime));
    } else if (selectedDateRange === 'month') {
      filtered = filtered.filter((e) => isThisMonth(e.datetime));
    }

    // Sort by datetime ascending
    filtered.sort((a, b) => Number(a.datetime - b.datetime));

    return filtered;
  }, [events, selectedCategory, selectedCity, selectedDateRange]);

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="relative h-72 sm:h-96 md:h-[500px]">
          <img
            src="/assets/generated/hero-banner.dim_1440x500.png"
            alt="Gambia Events - Discover the best cultural events in The Gambia"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-white text-sm font-medium">
                The Gambia's #1 Events Platform
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 leading-tight">
              Discover Amazing
              <br />
              <span className="text-gold">Events in Gambia</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-xl mb-6">
              Festivals, concerts, cultural ceremonies, and more — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/tourist">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 min-h-touch"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Tourist Mode
                </Button>
              </Link>
              <Button
                size="lg"
                className="min-h-touch"
                onClick={() =>
                  document
                    .getElementById('events-section')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Browse Events
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events-section" className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Pills */}
        <div className="mb-5">
          <CategoryPills selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <FilterBar
            city={selectedCity}
            dateRange={selectedDateRange}
            onCityChange={setSelectedCity}
            onDateRangeChange={setSelectedDateRange}
          />
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading...'
              : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border">
                <Skeleton className="aspect-[16/9] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="text-6xl">🎪</div>
            <h3 className="font-display text-xl font-bold">No Events Found</h3>
            <p className="text-muted-foreground max-w-sm">
              {events?.length === 0
                ? 'No events have been published yet. Check back soon!'
                : 'Try adjusting your filters to find more events.'}
            </p>
            {(selectedCategory !== 'all' ||
              selectedCity !== 'All Cities' ||
              selectedDateRange !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCity('All Cities');
                  setSelectedDateRange('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
