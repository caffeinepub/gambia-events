import ProtectedRoute from '../components/ProtectedRoute';
import RoleGuard from '../components/RoleGuard';
import {
  useListPendingEvents,
  useApproveEvent,
  useRejectEvent,
  useListAllUsers,
  useGetTicketSalesSummary,
  useGetAdminAnalytics,
  useSetEventFeatured,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserRole } from '../backend';
import { formatShortDate, getCategoryLabel, getCategoryEmoji } from '../lib/utils';
import {
  CheckCircle,
  XCircle,
  Users,
  BarChart3,
  Ticket,
  Calendar,
  Star,
  StarOff,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <RoleGuard requiredRole={UserRole.admin}>
        <AdminContent />
      </RoleGuard>
    </ProtectedRoute>
  );
}

function AdminContent() {
  const { data: pendingEvents, isLoading: pendingLoading } = useListPendingEvents();
  const { data: allUsers, isLoading: usersLoading } = useListAllUsers();
  const { data: salesSummary, isLoading: salesLoading } = useGetTicketSalesSummary();
  const { data: analytics, isLoading: analyticsLoading } = useGetAdminAnalytics();

  const { mutate: approveEvent, isPending: approving } = useApproveEvent();
  const { mutate: rejectEvent, isPending: rejecting } = useRejectEvent();
  const { mutate: setFeatured } = useSetEventFeatured();

  const handleApprove = (eventId: string) => {
    approveEvent(eventId, {
      onSuccess: () => toast.success('Event approved! ✓'),
      onError: (err) => toast.error(`Failed: ${err.message}`),
    });
  };

  const handleReject = (eventId: string) => {
    rejectEvent(eventId, {
      onSuccess: () => toast.success('Event rejected.'),
      onError: (err) => toast.error(`Failed: ${err.message}`),
    });
  };

  const handleToggleFeatured = (eventId: string, current: boolean) => {
    setFeatured(
      { eventId, isFeatured: !current },
      {
        onSuccess: () => toast.success(current ? 'Removed from featured.' : 'Event featured! ⭐'),
        onError: (err) => toast.error(`Failed: ${err.message}`),
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage events, users, and platform analytics.</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {analyticsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : analytics ? (
          <>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total Events</span>
              </div>
              <p className="text-3xl font-bold text-primary">{Number(analytics.totalEvents)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-forest" />
                <span className="text-sm text-muted-foreground">Total Users</span>
              </div>
              <p className="text-3xl font-bold text-forest">{Number(analytics.totalUsers)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-5 h-5 text-gold" />
                <span className="text-sm text-muted-foreground">Tickets Sold</span>
              </div>
              <p className="text-3xl font-bold text-gold">
                {Number(analytics.totalTicketsSold)}
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="pending" className="gap-2">
            <Calendar className="w-4 h-4" />
            Pending Events
            {pendingEvents && pendingEvents.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0">
                {pendingEvents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Ticket Sales
          </TabsTrigger>
        </TabsList>

        {/* Pending Events Tab */}
        <TabsContent value="pending">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-xl font-bold">Pending Events</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review and approve or reject submitted events.
              </p>
            </div>

            {pendingLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : pendingEvents && pendingEvents.length > 0 ? (
              <div className="divide-y divide-border">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    {/* Poster thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                      <img
                        src={event.posterImage.getDirectURL()}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                        <span>
                          {getCategoryEmoji(event.category)}{' '}
                          {getCategoryLabel(event.category)}
                        </span>
                        <span>📅 {formatShortDate(event.datetime)}</span>
                        <span>📍 {event.city}</span>
                        <span>
                          🎟{' '}
                          {event.ticketPrice === BigInt(0)
                            ? 'Free'
                            : `GMD ${Number(event.ticketPrice).toLocaleString()}`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleFeatured(event.id, event.isFeatured)}
                        className="gap-1.5"
                        title={event.isFeatured ? 'Remove featured' : 'Mark as featured'}
                      >
                        {event.isFeatured ? (
                          <StarOff className="w-3.5 h-3.5 text-gold" />
                        ) : (
                          <Star className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(event.id)}
                        disabled={rejecting}
                        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        {rejecting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(event.id)}
                        disabled={approving}
                        className="gap-1.5"
                      >
                        {approving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-display text-lg font-bold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground text-sm">
                  No pending events to review right now.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-xl font-bold">All Users</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {allUsers ? `${allUsers.length} registered users` : 'Loading...'}
              </p>
            </div>

            {usersLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : allUsers && allUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map(([principal, profile]) => (
                      <TableRow key={principal.toString()}>
                        <TableCell className="font-medium">{profile.displayName}</TableCell>
                        <TableCell>
                          <RoleBadge role={profile.role} />
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {principal.toString().substring(0, 20)}...
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatShortDate(profile.accountCreated)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="font-display text-lg font-bold mb-2">No Users Yet</h3>
                <p className="text-muted-foreground text-sm">
                  No users have registered on the platform yet.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Ticket Sales Tab */}
        <TabsContent value="sales">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-xl font-bold">Ticket Sales Summary</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Revenue and ticket sales per event.
              </p>
            </div>

            {salesLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : salesSummary && salesSummary.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead className="text-right">Tickets Sold</TableHead>
                      <TableHead className="text-right">Revenue (GMD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesSummary.map((summary) => (
                      <TableRow key={summary.eventId}>
                        <TableCell className="font-medium">{summary.eventTitle}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {Number(summary.totalTicketsSold).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {Number(summary.totalRevenue).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Totals row */}
                <div className="p-4 border-t border-border bg-muted/30 flex justify-between items-center">
                  <span className="font-semibold text-sm">Total Revenue</span>
                  <span className="font-bold text-lg text-primary">
                    GMD{' '}
                    {salesSummary
                      .reduce((sum, s) => sum + Number(s.totalRevenue), 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">🎟️</div>
                <h3 className="font-display text-lg font-bold mb-2">No Sales Yet</h3>
                <p className="text-muted-foreground text-sm">
                  Ticket sales will appear here once events are booked.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === UserRole.admin) {
    return (
      <Badge className="bg-primary text-primary-foreground text-xs">
        👑 Admin
      </Badge>
    );
  }
  if (role === UserRole.user) {
    return (
      <Badge variant="secondary" className="text-xs">
        👤 User
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs">
      👁 Guest
    </Badge>
  );
}
