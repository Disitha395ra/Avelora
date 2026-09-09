// ============================================================
// AVELORA — CORE TYPE DEFINITIONS
// ============================================================

// ---- Enums ----

export type UserRole = 'platform_admin' | 'event_organizer' | 'customer' | 'staff';

export type EventStatus =
  | 'draft'
  | 'published'
  | 'paused'
  | 'sold_out'
  | 'closed'
  | 'cancelled'
  | 'completed';

export type EventType =
  | 'concert'
  | 'conference'
  | 'symposium'
  | 'seminar'
  | 'workshop'
  | 'corporate'
  | 'university'
  | 'award_ceremony'
  | 'exhibition'
  | 'networking'
  | 'cultural'
  | 'sports'
  | 'community'
  | 'private'
  | 'other';

export type VenueType = 'physical' | 'online' | 'hybrid';

export type SeatingType = 'general_admission' | 'reserved' | 'table' | 'custom';

export type SeatStatus = 'available' | 'held' | 'booked' | 'blocked';

export type SeatType =
  | 'regular'
  | 'vip'
  | 'premium'
  | 'accessible'
  | 'table'
  | 'general_admission';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'refunded'
  | 'expired';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type TicketStatus = 'valid' | 'used' | 'cancelled' | 'invalid';

export type StaffPermission =
  | 'check_in'
  | 'view_attendees'
  | 'view_bookings'
  | 'manage_seating'
  | 'view_reports';

// ---- Profiles & Auth ----

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  country: string | null;
  organization: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// ---- Events ----

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  event_type: EventType;
  status: EventStatus;
  is_private: boolean;
  access_code: string | null;
  cover_image_url: string | null;
  organizer_name: string | null;
  organizer_logo_url: string | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  venue_type: VenueType;
  seating_type: SeatingType;
  max_capacity: number | null;
  booking_deadline: string | null;
  allow_cancellations: boolean;
  refund_policy: string | null;
  terms_and_conditions: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  currency: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  location?: EventLocation;
  ticket_types?: TicketType[];
  organizer?: Profile;
  category?: EventCategory;
}

export interface EventLocation {
  id: string;
  event_id: string;
  venue_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  online_url: string | null;
  online_platform: string | null;
  created_at: string;
}

export interface EventScheduleItem {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  speaker_id: string | null;
  track: string | null;
  sort_order: number;
  created_at: string;
}

export interface EventSpeaker {
  id: string;
  event_id: string;
  name: string;
  title: string | null;
  organization: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  sort_order: number;
  created_at: string;
}

// ---- Seating ----

export interface SeatingSection {
  id: string;
  event_id: string;
  name: string;
  label: string | null;
  color: string;
  seat_type: SeatType;
  price_override: number | null;
  capacity: number;
  sort_order: number;
  created_at: string;
  // Relations
  rows?: SeatingRow[];
}

export interface SeatingRow {
  id: string;
  section_id: string;
  event_id: string;
  label: string;
  sort_order: number;
  created_at: string;
  // Relations
  seats?: Seat[];
}

export interface Seat {
  id: string;
  event_id: string;
  section_id: string;
  row_id: string | null;
  label: string;
  row_label: string | null;
  seat_number: string | null;
  seat_type: SeatType;
  status: SeatStatus;
  price: number;
  held_until: string | null;
  held_by: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Ticket Types ----

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  quantity: number;
  quantity_sold: number;
  sale_start: string | null;
  sale_end: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// ---- Bookings ----

export interface Booking {
  id: string;
  booking_reference: string;
  event_id: string;
  customer_id: string;
  status: BookingStatus;
  subtotal: number;
  fees: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  event?: Event;
  customer?: Profile;
  items?: BookingItem[];
  payment?: Payment;
}

export interface BookingItem {
  id: string;
  booking_id: string;
  ticket_type_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  // Relations
  ticket_type?: TicketType;
  seats?: BookingSeat[];
}

export interface BookingSeat {
  id: string;
  booking_id: string;
  booking_item_id: string;
  seat_id: string;
  created_at: string;
  // Relations
  seat?: Seat;
}

export interface Attendee {
  id: string;
  booking_id: string;
  booking_item_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  created_at: string;
}

// ---- Payments ----

export interface Payment {
  id: string;
  booking_id: string;
  provider: string;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Invoices ----

export interface Invoice {
  id: string;
  invoice_number: string;
  booking_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
  file_url: string | null;
  created_at: string;
}

// ---- Tickets ----

export interface Ticket {
  id: string;
  ticket_code: string;
  booking_id: string;
  booking_item_id: string;
  attendee_id: string | null;
  seat_id: string | null;
  event_id: string;
  status: TicketStatus;
  qr_data: string;
  created_at: string;
  updated_at: string;
  // Relations
  event?: Event;
  seat?: Seat;
  attendee?: Attendee;
}

export interface TicketCheckin {
  id: string;
  ticket_id: string;
  checked_in_by: string;
  checked_in_at: string;
  location: string | null;
}

// ---- Staff ----

export interface EventStaff {
  id: string;
  event_id: string;
  user_id: string;
  invited_email: string;
  status: 'pending' | 'accepted' | 'declined';
  permissions: StaffPermission[];
  created_at: string;
  // Relations
  user?: Profile;
}

// ---- Discount Codes ----

export interface DiscountCode {
  id: string;
  event_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

// ---- Dashboard Stats ----

export interface OrganizerStats {
  total_events: number;
  active_events: number;
  upcoming_events: number;
  completed_events: number;
  total_bookings: number;
  total_revenue: number;
}

export interface EventStats {
  event_id: string;
  tickets_sold: number;
  seats_booked: number;
  remaining_seats: number;
  revenue: number;
  total_capacity: number;
  recent_bookings: Booking[];
}

// ---- Booking Flow ----

export interface SeatSelection {
  seatId: string;
  label: string;
  section: string;
  price: number;
  seatType: SeatType;
}

export interface TicketSelection {
  ticketTypeId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface BookingFormData {
  attendees: AttendeeFormData[];
  notes?: string;
}

export interface AttendeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  organization?: string;
}

// ---- Event Creation Wizard ----

export interface EventWizardData {
  // Step 1
  title: string;
  event_type: EventType;
  short_description: string;
  description: string;
  cover_image_url: string;
  organizer_name: string;
  organizer_logo_url: string;
  // Step 2
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  timezone: string;
  // Step 3
  venue_type: VenueType;
  venue_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  online_url: string;
  online_platform: string;
  // Step 4
  seating_type: SeatingType;
  // Step 5
  ticket_types: TicketTypeFormData[];
  // Step 6
  max_capacity: number | null;
  booking_deadline: string;
  allow_cancellations: boolean;
  refund_policy: string;
  terms_and_conditions: string;
  contact_email: string;
  contact_phone: string;
  currency: string;
  is_private: boolean;
  category_id: string;
}

export interface TicketTypeFormData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  sale_start: string;
  sale_end: string;
}

// ---- Reports ----

export interface EventReport {
  event: Event;
  booking_summary: {
    total_bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    refunded_bookings: number;
    total_tickets: number;
  };
  financial_summary: {
    gross_revenue: number;
    discounts: number;
    fees: number;
    taxes: number;
    refunds: number;
    net_revenue: number;
  };
  ticket_analysis: Array<{
    ticket_type: string;
    quantity_sold: number;
    revenue: number;
  }>;
  seating_analysis: Array<{
    section: string;
    total_seats: number;
    sold_seats: number;
    available_seats: number;
    revenue: number;
  }>;
  attendance: {
    registered: number;
    checked_in: number;
    no_shows: number;
  };
}
