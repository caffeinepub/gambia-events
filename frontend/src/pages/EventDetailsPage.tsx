import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetEvent } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import BookingModal from '../components/BookingModal';
import DigitalTicketView from '../components/DigitalTicketView';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatEventDate, getCategoryLabel, getCategoryColor, getCategoryEmoji } from '../lib/utils';
import { Calendar, MapPin, Ticket, Share2, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Ticket as TicketType } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function EventDetailsPage() {
  const { eventId } = useParams({ from: '/events/$eventId' });
  const { data: event, isLoading, error } = useGetEvent(eventId);
  const [showBooking, setShowBooking] = useState(false);
  const [bookedTicket, setBookedTicket] = useState<TicketType | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard! 🔗');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleBookingSuccess = (ticket: TicketType) => {
    setBookedTicket(ticket);
    setShowBooking(false);
    setShowTicket(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="w-full aspect-[16/7] rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="text-6xl">😕</div>
        <h2 className="font-display text-2xl font-bold">Event Not Found</h2>
        <p className="text-muted-foreground">This event may have been removed or doesn't exist.</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const isFree = event.ticketPrice === BigInt(0);
  const isSoldOut = event.ticketsRemaining === BigInt(0);
  const imageUrl = event.posterImage.getDirectURL();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      {/* Event Poster */}
      <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[16/7] bg-muted">
        <img
          src={imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/hero-banner.dim_1440x500.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {event.isFeatured && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gold text-gold-foreground">⭐ Featured Event</Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Category */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={getCategoryColor(event.category)}>
                {getCategoryEmoji(event.category)} {getCategoryLabel(event.category)}
              </Badge>
              {event.status === 'approved' && (
                <Badge variant="outline" className="text-success border-success/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-2">
              {event.title}
            </h1>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
              <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Date & Time</p>
                <p className="font-semibold text-sm mt-0.5">{formatEventDate(event.datetime)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
              <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Location</p>
                <p className="font-semibold text-sm mt-0.5">{event.city}</p>
                <p className="text-xs text-muted-foreground">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-display text-xl font-bold mb-3">About This Event</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Map Placeholder */}
          <div>
            <h2 className="font-display text-xl font-bold mb-3">Venue</h2>
            <div className="bg-muted/50 border border-border rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{event.location}</p>
                <p className="text-sm text-muted-foreground">{event.city}, The Gambia</p>
              </div>
            </div>
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Organized by</p>
              <p className="font-semibold text-sm">
                {event.organizerId.toString().substring(0, 20)}...
              </p>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Ticket Price</p>
              <p className={`text-3xl font-bold mt-1 ${isFree ? 'text-success' : 'text-primary'}`}>
                {isFree ? 'Free' : `GMD ${Number(event.ticketPrice).toLocaleString()}`}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span className={`font-semibold ${isSoldOut ? 'text-destructive' : 'text-foreground'}`}>
                {isSoldOut ? 'Sold Out' : `${Number(event.ticketsRemaining)} tickets`}
              </span>
            </div>

            <Button
              className="w-full min-h-touch text-base"
              size="lg"
              disabled={isSoldOut}
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Please login to book tickets');
                  return;
                }
                setShowBooking(true);
              }}
            >
              <Ticket className="w-5 h-5 mr-2" />
              {isSoldOut ? 'Sold Out' : 'Book Tickets'}
            </Button>

            <Button
              variant="outline"
              className="w-full min-h-touch gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Share Event
            </Button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal
          event={event}
          open={showBooking}
          onClose={() => setShowBooking(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Digital Ticket Dialog */}
      <Dialog open={showTicket} onOpenChange={setShowTicket}>
        <DialogContent className="sm:max-w-sm">
          {bookedTicket && (
            <DigitalTicketView ticket={bookedTicket} event={event} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
