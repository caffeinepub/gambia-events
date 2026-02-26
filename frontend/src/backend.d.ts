import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface EventTicketSummary {
    eventId: string;
    totalTicketsSold: bigint;
    eventTitle: string;
    totalRevenue: bigint;
}
export interface Event {
    id: string;
    status: EventStatus;
    title: string;
    ticketQuantity: bigint;
    city: string;
    createdAt: Time;
    description: string;
    organizerId: Principal;
    isFeatured: boolean;
    category: EventCategory;
    posterImage: ExternalBlob;
    ticketsRemaining: bigint;
    ticketPrice: bigint;
    location: string;
    datetime: Time;
}
export interface AdminAnalytics {
    totalTicketsSold: bigint;
    totalEvents: bigint;
    totalUsers: bigint;
}
export interface Ticket {
    eventId: string;
    paymentStatus: Variant_pending_confirmed;
    paymentMethod: PaymentMethod;
    userId: Principal;
    ticketId: string;
    bookingCode: string;
    timestamp: Time;
    quantity: bigint;
}
export interface UserProfile {
    displayName: string;
    role: UserRole;
    accountCreated: Time;
}
export enum EventCategory {
    music = "music",
    community = "community",
    culture = "culture",
    festivals = "festivals",
    nightlife = "nightlife",
    comedy = "comedy",
    fashion = "fashion"
}
export enum EventStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum PaymentMethod {
    cash = "cash",
    wave = "wave",
    africellMoney = "africellMoney",
    qMoney = "qMoney"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_confirmed {
    pending = "pending",
    confirmed = "confirmed"
}
export interface backendInterface {
    /**
     * / Approve an event. Admin only.
     */
    approveEvent(eventId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Book tickets for an event. Authenticated users only.
     */
    bookTickets(eventId: string, quantity: bigint, paymentMethod: PaymentMethod): Promise<Ticket>;
    /**
     * / Create a new event. Only authenticated users (organizers) may create events.
     */
    createEvent(title: string, description: string, category: EventCategory, city: string, datetime: Time, location: string, ticketPrice: bigint, ticketQuantity: bigint, posterImage: ExternalBlob): Promise<string>;
    /**
     * / Get basic analytics. Admin only.
     */
    getAdminAnalytics(): Promise<AdminAnalytics>;
    /**
     * / Get the caller's own user profile.
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get a single event by ID. Public.
     */
    getEvent(eventId: string): Promise<Event | null>;
    /**
     * / List events created by the caller (organizer dashboard). Authenticated users only.
     */
    getMyEvents(): Promise<Array<Event>>;
    /**
     * / Get the caller's own tickets. Authenticated users only.
     */
    getMyTickets(): Promise<Array<Ticket>>;
    /**
     * / Get ticket sales summary per event. Admin only.
     */
    getTicketSalesSummary(): Promise<Array<EventTicketSummary>>;
    /**
     * / Get any user's profile. Callers may only view their own profile unless they are an admin.
     */
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Get tickets for a user. Users can only view their own tickets; admins can view any.
     */
    getUserTickets(user: Principal): Promise<Array<Ticket>>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List all users with their profiles. Admin only.
     */
    listAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    /**
     * / List all approved events. Public.
     */
    listApprovedEvents(): Promise<Array<Event>>;
    /**
     * / List approved events by category. Public.
     */
    listEventsByCategory(category: EventCategory): Promise<Array<Event>>;
    /**
     * / List approved events by city. Public.
     */
    listEventsByCity(city: string): Promise<Array<Event>>;
    /**
     * / List all pending events. Admin only.
     */
    listPendingEvents(): Promise<Array<Event>>;
    /**
     * / Reject an event. Admin only.
     */
    rejectEvent(eventId: string): Promise<void>;
    /**
     * / Save / update the caller's own user profile.
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Search approved events by title, description, or city. Public.
     */
    searchEvents(searchTerm: string): Promise<Array<Event>>;
    /**
     * / Set featured flag on an event. Admin only.
     */
    setEventFeatured(eventId: string, isFeatured: boolean): Promise<void>;
}
