import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  // Role-based access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Unique ID Tracking
  let usedTicketIds = Set.empty<Text>();

  // Event Categories
  type EventCategory = {
    #music;
    #festivals;
    #culture;
    #nightlife;
    #comedy;
    #fashion;
    #community;
  };

  module EventCategory {
    public func compare(a : EventCategory, b : EventCategory) : Order.Order {
      switch (a, b) {
        case (#music, #music) { #equal };
        case (#music, _) { #less };
        case (_, #music) { #greater };

        case (#festivals, #festivals) { #equal };
        case (#festivals, _) { #less };
        case (_, #festivals) { #greater };

        case (#culture, #culture) { #equal };
        case (#culture, _) { #less };
        case (_, #culture) { #greater };

        case (#nightlife, #nightlife) { #equal };
        case (#nightlife, _) { #less };
        case (_, #nightlife) { #greater };

        case (#comedy, #comedy) { #equal };
        case (#comedy, _) { #less };
        case (_, #comedy) { #greater };

        case (#fashion, #fashion) { #equal };
        case (#fashion, _) { #less };
        case (_, #fashion) { #greater };

        case (#community, #community) { #equal };
      };
    };
  };

  // Event Status
  type EventStatus = { #pending; #approved; #rejected };
  module EventStatus {
    public func compare(a : EventStatus, b : EventStatus) : Order.Order {
      switch (a, b) {
        case (#pending, #pending) { #equal };
        case (#pending, _) { #less };
        case (_, #pending) { #greater };

        case (#approved, #approved) { #equal };
        case (#approved, #rejected) { #less };

        case (#rejected, #rejected) { #equal };
        case (#rejected, _) { #greater };
      };
    };
  };

  // Ticket Data Types
  type PaymentMethod = { #wave; #africellMoney; #qMoney; #cash };
  module PaymentMethod {
    public func compare(a : PaymentMethod, b : PaymentMethod) : Order.Order {
      switch (a, b) {
        case (#wave, #wave) { #equal };
        case (#wave, _) { #less };
        case (_, #wave) { #greater };

        case (#africellMoney, #africellMoney) { #equal };
        case (#africellMoney, #qMoney) { #less };
        case (#africellMoney, #cash) { #less };

        case (#qMoney, #qMoney) { #equal };
        case (#qMoney, #cash) { #less };
        case (#qMoney, _) { #greater };

        case (#cash, #cash) { #equal };
        case (#cash, _) { #greater };
      };
    };
  };

  type Ticket = {
    ticketId : Text;
    eventId : Text;
    userId : Principal;
    quantity : Nat;
    paymentMethod : PaymentMethod;
    paymentStatus : { #confirmed; #pending };
    bookingCode : Text;
    timestamp : Time.Time;
  };

  module Ticket {
    public func compare(ticket1 : Ticket, ticket2 : Ticket) : Order.Order {
      Text.compare(ticket1.ticketId, ticket2.ticketId);
    };
  };

  // User Profile Data
  type UserProfile = {
    displayName : Text;
    role : AccessControl.UserRole;
    accountCreated : Time.Time;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      switch (Text.compare(profile1.displayName, profile2.displayName)) {
        case (#equal) { compareRoles(profile1.role, profile2.role) };
        case (order) { order };
      };
    };

    public func compareByRole(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      compareRoles(profile1.role, profile2.role);
    };

    func compareRoles(a : AccessControl.UserRole, b : AccessControl.UserRole) : Order.Order {
      func roleOrder(role : AccessControl.UserRole) : Nat {
        switch (role) {
          case (#admin) { 0 };
          case (#user) { 1 };
          case (#guest) { 2 };
        };
      };
      Nat.compare(roleOrder(a), roleOrder(b));
    };
  };

  // User Data
  type User = {
    context : ?{
      provider : {
        #wave;
        #africell;
        #qcell;
      };
      phone : ?Nat;
      paidInFull : Bool;
    };
    profile : UserProfile;
    tickets : List.List<Ticket>;
  };

  module User {
    public func compare(user1 : User, user2 : User) : Order.Order {
      UserProfile.compare(user1.profile, user2.profile);
    };

    public func compareByRole(user1 : User, user2 : User) : Order.Order {
      UserProfile.compareByRole(user1.profile, user2.profile);
    };
  };

  // Event Data
  type Event = {
    id : Text;
    title : Text;
    description : Text;
    category : EventCategory;
    city : Text;
    datetime : Time.Time;
    location : Text;
    ticketPrice : Nat;
    ticketQuantity : Nat;
    ticketsRemaining : Nat;
    organizerId : Principal;
    posterImage : Storage.ExternalBlob;
    isFeatured : Bool;
    status : EventStatus;
    createdAt : Time.Time;
  };

  module Event {
    public func compare(event1 : Event, event2 : Event) : Order.Order {
      Text.compare(event1.title, event2.title);
    };

    public func compareByCategory(event1 : Event, event2 : Event) : Order.Order {
      switch (EventCategory.compare(event1.category, event2.category)) {
        case (#equal) { Text.compare(event1.title, event2.title) };
        case (order) { order };
      };
    };
  };

  // State
  let users = Map.empty<Principal, User>();
  let events = Map.empty<Text, Event>();
  let eventBookings = Map.empty<Text, List.List<Ticket>>();

  // Ticket Helper Functions
  func generateUniqueTicketId(baseId : Text) : Text {
    var ticketId = baseId;
    var counter = 0;
    while (usedTicketIds.contains(ticketId)) {
      ticketId := baseId # "_" # counter.toText();
      counter += 1;
    };
    usedTicketIds.add(ticketId);
    ticketId;
  };

  // -----------------------------------------------------------------------
  // User Profile Functions (required by frontend)
  // -----------------------------------------------------------------------

  /// Get the caller's own user profile.
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
    };
    switch (users.get(caller)) {
      case (null) { null };
      case (?user) { ?user.profile };
    };
  };

  /// Save / update the caller's own user profile.
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save their profile");
    };
    let existing = users.get(caller);
    let tickets = switch (existing) {
      case (null) { List.empty<Ticket>() };
      case (?u) { u.tickets };
    };
    let updatedUser : User = {
      context = switch (existing) {
        case (null) { null };
        case (?u) { u.context };
      };
      profile;
      tickets;
    };
    users.add(caller, updatedUser);
  };

  /// Get any user's profile. Callers may only view their own profile unless they are an admin.
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?u) { ?u.profile };
    };
  };

  // -----------------------------------------------------------------------
  // Event Management
  // -----------------------------------------------------------------------

  /// Create a new event. Only authenticated users (organizers) may create events.
  public shared ({ caller }) func createEvent(
    title : Text,
    description : Text,
    category : EventCategory,
    city : Text,
    datetime : Time.Time,
    location : Text,
    ticketPrice : Nat,
    ticketQuantity : Nat,
    posterImage : Storage.ExternalBlob
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create events");
    };

    let cleanedTitle = title.replace(#char ' ', "");
    let id = cleanedTitle # Time.now().toText();

    let event : Event = {
      id;
      title;
      description;
      category;
      city;
      datetime;
      location;
      ticketPrice;
      ticketQuantity;
      ticketsRemaining = ticketQuantity;
      organizerId = caller;
      posterImage;
      isFeatured = false;
      status = #pending;
      createdAt = Time.now();
    };

    events.add(id, event);
    id;
  };

  /// Approve an event. Admin only.
  public shared ({ caller }) func approveEvent(eventId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve events");
    };
    let event = switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?e) { e };
    };
    events.add(eventId, { event with status = #approved });
  };

  /// Reject an event. Admin only.
  public shared ({ caller }) func rejectEvent(eventId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject events");
    };
    let event = switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?e) { e };
    };
    events.add(eventId, { event with status = #rejected });
  };

  /// Set featured flag on an event. Admin only.
  public shared ({ caller }) func setEventFeatured(eventId : Text, isFeatured : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can feature events");
    };
    let event = switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?e) { e };
    };
    events.add(eventId, { event with isFeatured });
  };

  /// List all approved events. Public.
  public query func listApprovedEvents() : async [Event] {
    let result = List.empty<Event>();
    events.values().forEach(func(event) {
      if (event.status == #approved) {
        result.add(event);
      };
    });
    result.toArray();
  };

  /// List approved events by category. Public.
  public query func listEventsByCategory(category : EventCategory) : async [Event] {
    let result = List.empty<Event>();
    events.values().forEach(func(event) {
      if (event.status == #approved and event.category == category) {
        result.add(event);
      };
    });
    result.toArray();
  };

  /// List approved events by city. Public.
  public query func listEventsByCity(city : Text) : async [Event] {
    let result = List.empty<Event>();
    events.values().forEach(func(event) {
      if (event.status == #approved and event.city == city) {
        result.add(event);
      };
    });
    result.toArray();
  };

  /// Get a single event by ID. Public.
  public query func getEvent(eventId : Text) : async ?Event {
    events.get(eventId);
  };

  /// List events created by the caller (organizer dashboard). Authenticated users only.
  public query ({ caller }) func getMyEvents() : async [Event] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their events");
    };
    let result = List.empty<Event>();
    events.values().forEach(func(event) {
      if (event.organizerId == caller) {
        result.add(event);
      };
    });
    result.toArray();
  };

  /// List all pending events. Admin only.
  public query ({ caller }) func listPendingEvents() : async [Event] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list pending events");
    };
    let result = List.empty<Event>();
    events.values().forEach(func(event) {
      if (event.status == #pending) {
        result.add(event);
      };
    });
    result.toArray();
  };

  // -----------------------------------------------------------------------
  // Ticket Booking
  // -----------------------------------------------------------------------

  /// Book tickets for an event. Authenticated users only.
  public shared ({ caller }) func bookTickets(
    eventId : Text,
    quantity : Nat,
    paymentMethod : PaymentMethod
  ) : async Ticket {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can book tickets");
    };

    let event = switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) { event };
    };

    if (event.status != #approved) {
      Runtime.trap("Event is not available for booking");
    };

    if (event.ticketsRemaining < quantity) {
      Runtime.trap("Not enough tickets available");
    };

    let ticketId = generateUniqueTicketId(eventId # "_" # caller.toText());

    // Cash payments are pending; mobile money payments are confirmed immediately
    let paymentStatus : { #confirmed; #pending } = switch (paymentMethod) {
      case (#cash) { #pending };
      case (_) { #confirmed };
    };

    let ticket : Ticket = {
      ticketId;
      eventId;
      userId = caller;
      quantity;
      paymentMethod;
      paymentStatus;
      bookingCode = ticketId # "_" # Time.now().toText();
      timestamp = Time.now();
    };

    let updatedEvent : Event = {
      event with
      ticketsRemaining = event.ticketsRemaining - quantity
    };
    events.add(eventId, updatedEvent);

    // Store booking in eventBookings map
    let existingBookings = switch (eventBookings.get(eventId)) {
      case (null) { List.empty<Ticket>() };
      case (?list) { list };
    };
    existingBookings.add(ticket);
    eventBookings.add(eventId, existingBookings);

    // Store ticket in user's profile
    let user = switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found; please set up your profile first") };
      case (?user) { user };
    };
    user.tickets.add(ticket);

    ticket;
  };

  /// Get tickets for a user. Users can only view their own tickets; admins can view any.
  public query ({ caller }) func getUserTickets(user : Principal) : async [Ticket] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tickets");
    };
    switch (users.get(user)) {
      case (null) { [] };
      case (?profile) { profile.tickets.toArray() };
    };
  };

  /// Get the caller's own tickets. Authenticated users only.
  public query ({ caller }) func getMyTickets() : async [Ticket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their tickets");
    };
    switch (users.get(caller)) {
      case (null) { [] };
      case (?profile) { profile.tickets.toArray() };
    };
  };

  // -----------------------------------------------------------------------
  // Search
  // -----------------------------------------------------------------------

  /// Search approved events by title, description, or city. Public.
  public query func searchEvents(searchTerm : Text) : async [Event] {
    let lowerTerm = searchTerm.toLower();
    let filteredEvents = List.empty<Event>();
    events.values().forEach(
      func(event) {
        if (event.status == #approved) {
          if (
            event.title.toLower().contains(#text(lowerTerm)) or
            event.description.toLower().contains(#text(lowerTerm)) or
            event.city.toLower().contains(#text(lowerTerm))
          ) {
            filteredEvents.add(event);
          };
        };
      }
    );
    filteredEvents.toArray();
  };

  // -----------------------------------------------------------------------
  // Admin Dashboard
  // -----------------------------------------------------------------------

  /// List all users with their profiles. Admin only.
  public query ({ caller }) func listAllUsers() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    let result = List.empty<(Principal, UserProfile)>();
    users.entries().forEach(func(principal, user) {
      result.add((principal, user.profile));
    });
    result.toArray();
  };

  type EventTicketSummary = {
    eventId : Text;
    eventTitle : Text;
    totalTicketsSold : Nat;
    totalRevenue : Nat;
  };

  /// Get ticket sales summary per event. Admin only.
  public query ({ caller }) func getTicketSalesSummary() : async [EventTicketSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view ticket sales summary");
    };
    let result = List.empty<EventTicketSummary>();
    eventBookings.entries().forEach(func(eventId, tickets) {
      let eventOpt = events.get(eventId);
      switch (eventOpt) {
        case (null) {};
        case (?event) {
          var totalTicketsSold = 0;
          var totalRevenue = 0;
          tickets.forEach(func(ticket) {
            totalTicketsSold += ticket.quantity;
            totalRevenue += ticket.quantity * event.ticketPrice;
          });
          result.add({
            eventId;
            eventTitle = event.title;
            totalTicketsSold;
            totalRevenue;
          });
        };
      };
    });
    result.toArray();
  };

  type AdminAnalytics = {
    totalEvents : Nat;
    totalUsers : Nat;
    totalTicketsSold : Nat;
  };

  /// Get basic analytics. Admin only.
  public query ({ caller }) func getAdminAnalytics() : async AdminAnalytics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    var totalTicketsSold = 0;
    eventBookings.values().forEach(func(tickets) {
      tickets.forEach(func(ticket) {
        totalTicketsSold += ticket.quantity;
      });
    });
    {
      totalEvents = events.size();
      totalUsers = users.size();
      totalTicketsSold;
    };
  };
};
