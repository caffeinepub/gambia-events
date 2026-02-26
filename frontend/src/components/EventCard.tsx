import { Link } from '@tanstack/react-router';
import { Event, EventStatus } from '../backend';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { formatEventDate, getCategoryLabel, getCategoryColor } from '../lib/utils';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const isFree = event.ticketPrice === BigInt(0);
  const imageUrl = event.posterImage.getDirectURL();

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group block bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1"
    >
      {/* Poster Image */}
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        <img
          src={imageUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/generated/hero-banner.dim_1440x500.png';
          }}
        />
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`text-xs font-semibold ${getCategoryColor(event.category)}`}>
            {getCategoryLabel(event.category)}
          </Badge>
        </div>
        {/* Featured Badge */}
        {event.isFeatured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gold text-gold-foreground text-xs">⭐ Featured</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-bold text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span>{formatEventDate(event.datetime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span className="truncate">{event.city}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-primary" />
            <span className={`font-bold text-sm ${isFree ? 'text-success' : 'text-primary'}`}>
              {isFree ? 'Free' : `GMD ${Number(event.ticketPrice).toLocaleString()}`}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {Number(event.ticketsRemaining)} left
          </span>
        </div>
      </div>
    </Link>
  );
}
