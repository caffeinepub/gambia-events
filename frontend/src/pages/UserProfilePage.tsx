import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DigitalTicketView from '../components/DigitalTicketView';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useGetMyTickets, useGetEvent } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { UserRole, Ticket as TicketType } from '../backend';
import { formatShortDate } from '../lib/utils';
import { User, Ticket, Eye, Calendar, Shield, Crown } from 'lucide-react';

export default function UserProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: tickets, isLoading: ticketsLoading } = useGetMyTickets();

  if (profileLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
        {/* Cover */}
        <div className="h-24 bg-gradient-to-r from-primary via-primary/80 to-gold" />

        {/* Avatar & Info */}
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <div className="w-20 h-20 rounded-2xl bg-card border-4 border-card flex items-center justify-center shadow-card">
              <User className="w-10 h-10 text-primary" />
            </div>
            <RoleBadge role={profile?.role ?? UserRole.guest} />
          </div>

          <h1 className="font-display text-2xl font-bold">
            {profile?.displayName ?? 'Anonymous User'}
          </h1>

          {profile && (
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatShortDate(profile.accountCreated)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ticket className="w-4 h-4" />
                <span>{tickets?.length ?? 0} ticket{(tickets?.length ?? 0) !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Tickets Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">My Tickets</h2>
            <p className="text-sm text-muted-foreground">
              {tickets?.length ?? 0} booked ticket{(tickets?.length ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {ticketsLoading ? (
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
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
            <div className="text-5xl">🎟️</div>
            <h3 className="font-display text-lg font-bold">No Tickets Yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Browse events and book your first ticket to see it here.
            </p>
            <Button asChild variant="outline">
              <a href="/">Browse Events</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

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

function RoleBadge({ role }: { role: UserRole }) {
  if (role === UserRole.admin) {
    return (
      <Badge className="bg-primary text-primary-foreground gap-1.5">
        <Crown className="w-3 h-3" />
        Admin
      </Badge>
    );
  }
  if (role === UserRole.user) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <User className="w-3 h-3" />
        Member
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1.5">
      <Shield className="w-3 h-3" />
      Guest
    </Badge>
  );
}
