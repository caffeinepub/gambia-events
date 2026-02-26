import { useMemo } from 'react';
import { useListApprovedEvents, useListEventsByCategory } from '../hooks/useQueries';
import EventCard from '../components/EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { EventCategory } from '../backend';
import { Globe, Flame, Star, Compass } from 'lucide-react';

export default function TouristModePage() {
  const { data: allEvents, isLoading: allLoading } = useListApprovedEvents();
  const { data: cultureEvents, isLoading: cultureLoading } = useListEventsByCategory(
    EventCategory.culture
  );
  const { data: festivalEvents, isLoading: festivalLoading } = useListEventsByCategory(
    EventCategory.festivals
  );

  const isLoading = allLoading || cultureLoading || festivalLoading;

  // Cultural Experiences: merge culture + festivals, deduplicate
  const culturalExperiences = useMemo(() => {
    const merged = [...(cultureEvents ?? []), ...(festivalEvents ?? [])];
    const seen = new Set<string>();
    return merged.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [cultureEvents, festivalEvents]);

  // Popular This Week: sort by tickets sold (ticketQuantity - ticketsRemaining) desc, top 5
  const popularThisWeek = useMemo(() => {
    if (!allEvents) return [];
    return [...allEvents]
      .sort(
        (a, b) =>
          Number(b.ticketQuantity - b.ticketsRemaining) -
          Number(a.ticketQuantity - a.ticketsRemaining)
      )
      .slice(0, 5);
  }, [allEvents]);

  // Recommended for Visitors: featured events
  const recommendedForVisitors = useMemo(() => {
    if (!allEvents) return [];
    return allEvents.filter((e) => e.isFeatured);
  }, [allEvents]);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-forest via-forest/80 to-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 text-8xl">🥁</div>
          <div className="absolute top-8 right-12 text-6xl">🌍</div>
          <div className="absolute bottom-4 left-1/3 text-7xl">🎭</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-4">
            <Globe className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">For Visitors & Tourists</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Explore The Gambia
            <br />
            <span className="text-gold">Like Never Before</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Discover authentic cultural experiences, vibrant festivals, and unforgettable events
            curated especially for visitors to The Smiling Coast of Africa.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">
        {/* Recommended for Visitors */}
        <Section
          icon={<Star className="w-6 h-6 text-gold" />}
          title="Recommended for Visitors"
          subtitle="Hand-picked featured events perfect for tourists"
          accentColor="text-gold"
        >
          {isLoading ? (
            <EventGridSkeleton count={3} />
          ) : recommendedForVisitors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedForVisitors.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="⭐"
              title="No Featured Events Yet"
              message="Check back soon for curated visitor recommendations."
            />
          )}
        </Section>

        {/* Cultural Experiences */}
        <Section
          icon={<Compass className="w-6 h-6 text-forest" />}
          title="Cultural Experiences"
          subtitle="Immerse yourself in Gambian culture and traditions"
          accentColor="text-forest"
        >
          {isLoading ? (
            <EventGridSkeleton count={4} />
          ) : culturalExperiences.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {culturalExperiences.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="🏺"
              title="No Cultural Events Right Now"
              message="Cultural events and festivals will appear here when available."
            />
          )}
        </Section>

        {/* Popular This Week */}
        <Section
          icon={<Flame className="w-6 h-6 text-primary" />}
          title="Popular This Week"
          subtitle="The most-booked events happening right now"
          accentColor="text-primary"
        >
          {isLoading ? (
            <EventGridSkeleton count={5} />
          ) : popularThisWeek.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {popularThisWeek.map((event, index) => (
                <div key={event.id} className="relative">
                  {index < 3 && (
                    <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                      #{index + 1}
                    </div>
                  )}
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="🔥"
              title="No Events Yet"
              message="Popular events will appear here as tickets are booked."
            />
          )}
        </Section>

        {/* Gambia Info Card */}
        <section className="bg-card border border-border rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold mb-4 text-center">
            🌍 About The Gambia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              {
                emoji: '🏖️',
                title: 'The Smiling Coast',
                desc: 'Known for its beautiful beaches along the Atlantic Ocean and warm, welcoming people.',
              },
              {
                emoji: '🥁',
                title: 'Rich Culture',
                desc: 'Experience vibrant music, traditional ceremonies, and diverse ethnic traditions.',
              },
              {
                emoji: '🌅',
                title: 'Year-Round Events',
                desc: 'From beach parties to cultural festivals, there\'s always something happening.',
              },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="space-y-2">
                <div className="text-4xl">{emoji}</div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  accentColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h2 className={`font-display text-2xl font-bold ${accentColor}`}>{title}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function EventGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
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
  );
}

function EmptyState({
  emoji,
  title,
  message,
}: {
  emoji: string;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
      <div className="text-5xl">{emoji}</div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm">{message}</p>
    </div>
  );
}
