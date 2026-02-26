import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  EventCategory,
  PaymentMethod,
  UserProfile,
  UserRole,
  ExternalBlob,
} from '../backend';

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function useListApprovedEvents() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['approvedEvents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovedEvents();
    },
    enabled: !isFetching,
  });
}

export function useGetEvent(eventId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getEvent(eventId);
    },
    enabled: !!eventId && !isFetching,
  });
}

export function useListEventsByCategory(category: EventCategory) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['eventsByCategory', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listEventsByCategory(category);
    },
    enabled: !isFetching,
  });
}

export function useListEventsByCity(city: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['eventsByCity', city],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listEventsByCity(city);
    },
    enabled: !!city && !isFetching,
  });
}

export function useSearchEvents(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['searchEvents', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchEvents(searchTerm);
    },
    enabled: !!searchTerm && searchTerm.length >= 2 && !isFetching,
  });
}

export function useGetMyEvents() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['myEvents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

interface CreateEventParams {
  title: string;
  description: string;
  category: EventCategory;
  city: string;
  datetime: bigint;
  location: string;
  ticketPrice: bigint;
  ticketQuantity: bigint;
  posterImage: ExternalBlob;
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateEventParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEvent(
        params.title,
        params.description,
        params.category,
        params.city,
        params.datetime,
        params.location,
        params.ticketPrice,
        params.ticketQuantity,
        params.posterImage,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      queryClient.invalidateQueries({ queryKey: ['approvedEvents'] });
    },
  });
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export function useGetMyTickets() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['myTickets'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTickets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookTickets() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      quantity,
      paymentMethod,
    }: {
      eventId: string;
      quantity: bigint;
      paymentMethod: PaymentMethod;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookTickets(eventId, quantity, paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
      queryClient.invalidateQueries({ queryKey: ['approvedEvents'] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useListPendingEvents() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['pendingEvents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPendingEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingEvents'] });
      queryClient.invalidateQueries({ queryKey: ['approvedEvents'] });
    },
  });
}

export function useRejectEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingEvents'] });
    },
  });
}

export function useSetEventFeatured() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, isFeatured }: { eventId: string; isFeatured: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setEventFeatured(eventId, isFeatured);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedEvents'] });
      queryClient.invalidateQueries({ queryKey: ['pendingEvents'] });
    },
  });
}

export function useListAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTicketSalesSummary() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['ticketSalesSummary'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTicketSalesSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdminAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: import('@dfinity/principal').Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}
