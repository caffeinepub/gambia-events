import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DigitalTicketView from '../components/DigitalTicketView';
import { useGetMyTickets } from '../hooks/useQueries';
import { useGetEvent } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket as TicketType } from '../backend';
import { Eye, Ticket } from 'lucide-react';

function TicketItem({ ticket }: { ticket: TicketType }) {
  const { data: event } = useGetEvent(ticket.eventId);
  const [showFull, setShowFull] = useState(false);

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-card transition-shadow">
        <div className="flex-1 min-w-0">
          <DigitalTicketView ticket={ticket} event={event} compact />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFull(true)}
          className="shrink-0 gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </Button>
      </div>

      <Dialog open={showFull} onOpenChange={setShowFull}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Your Ticket</DialogTitle>
          </DialogHeader>
          <DigitalTicketView ticket={ticket} event={event} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function MyTicketsPage() {
  const { data: tickets, isLoading } = useGetMyTickets();

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">My Tickets</h1>
            <p className="text-muted-foreground text-sm">Your booked event tickets</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : tickets && tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketItem key={ticket.ticketId} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="text-6xl">🎟️</div>
            <h3 className="font-display text-xl font-bold">No Tickets Yet</h3>
            <p className="text-muted-foreground max-w-sm">
              You haven't booked any tickets yet. Discover amazing events and book your first ticket!
            </p>
            <Button asChild>
              <a href="/">Browse Events</a>
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
