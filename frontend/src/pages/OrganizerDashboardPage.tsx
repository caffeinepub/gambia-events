import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import EventCreationForm from '../components/EventCreationForm';
import { useGetMyEvents } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatShortDate, getCategoryLabel, getCategoryEmoji } from '../lib/utils';
import { EventStatus } from '../backend';
import { PlusCircle, List, Calendar, Ticket, TrendingUp } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';

function StatusBadge({ status }: { status: EventStatus }) {
  if (status === EventStatus.approved) {
    return <Badge className="bg-success text-success-foreground">✓ Approved</Badge>;
  }
  if (status === EventStatus.rejected) {
    return <Badge variant="destructive">✗ Rejected</Badge>;
  }
  return <Badge variant="secondary">⏳ Pending Review</Badge>;
}

export default function OrganizerDashboardPage() {
  const { data: myEvents, isLoading } = useGetMyEvents();
  const { data: profile } = useGetCallerUserProfile();
  const [activeTab, setActiveTab] = useState('create');

  const approvedCount = myEvents?.filter((e) => e.status === EventStatus.approved).length ?? 0;
  const pendingCount = myEvents?.filter((e) => e.status === EventStatus.pending).length ?? 0;
  const totalTicketsSold = myEvents?.reduce((sum, e) => sum + (Number(e.ticketQuantity) - Number(e.ticketsRemaining)), 0) ?? 0;

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-1">Organizer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.displayName ?? 'Organizer'}! Manage your events here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Events', value: myEvents?.length ?? 0, icon: Calendar, color: 'text-primary' },
            { label: 'Approved', value: approvedCount, icon: TrendingUp, color: 'text-success' },
            { label: 'Pending', value: pendingCount, icon: List, color: 'text-gold' },
            { label: 'Tickets Sold', value: totalTicketsSold, icon: Ticket, color: 'text-primary' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="create" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Create Event
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <List className="w-4 h-4" />
              My Events ({myEvents?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold mb-5">Create New Event</h2>
              <EventCreationForm onSuccess={() => setActiveTab('events')} />
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="font-display text-xl font-bold">My Events</h2>
              </div>

              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              ) : myEvents && myEvents.length > 0 ? (
                <div className="divide-y divide-border">
                  {myEvents.map((event) => {
                    const ticketsSold = Number(event.ticketQuantity) - Number(event.ticketsRemaining);
                    return (
                      <div key={event.id} className="p-4 sm:p-6 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                          <img
                            src={event.posterImage.getDirectURL()}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                            <StatusBadge status={event.status} />
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>{getCategoryEmoji(event.category)} {getCategoryLabel(event.category)}</span>
                            <span>📅 {formatShortDate(event.datetime)}</span>
                            <span>📍 {event.city}</span>
                            <span>🎟 {ticketsSold}/{Number(event.ticketQuantity)} sold</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-5xl mb-4">🎪</div>
                  <h3 className="font-display text-lg font-bold mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Create your first event to get started!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
