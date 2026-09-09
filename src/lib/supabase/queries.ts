import { supabase } from './client';
import type { Event, EventLocation, EventSpeaker, EventScheduleItem, TicketType } from '@/types';

// ---- Events ----

export async function getPublishedEvents(filters?: {
  search?: string;
  category?: string;
  city?: string;
  country?: string;
  event_type?: string;
  date_from?: string;
  date_to?: string;
  is_free?: boolean;
}) {
  let query = supabase
    .from('events')
    .select(`
      *,
      location:event_locations(*),
      ticket_types(*),
      category:event_categories(*)
    `)
    .eq('status', 'published')
    .eq('is_private', false)
    .order('start_date', { ascending: true });

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }
  if (filters?.event_type) {
    query = query.eq('event_type', filters.event_type);
  }
  if (filters?.date_from) {
    query = query.gte('start_date', filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte('start_date', filters.date_to);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Event[];
}

export async function getEventBySlug(slug: string) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      location:event_locations(*),
      ticket_types(*),
      category:event_categories(*),
      speakers:event_speakers(*),
      schedules:event_schedules(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as Event & {
    location: EventLocation;
    ticket_types: TicketType[];
    speakers: EventSpeaker[];
    schedules: EventScheduleItem[];
  };
}

export async function getOrganizerEvents(organizerId: string) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      location:event_locations(*),
      ticket_types(*)
    `)
    .eq('organizer_id', organizerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Event[];
}

export async function createEvent(eventData: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function updateEventStatus(id: string, status: Event['status']) {
  return updateEvent(id, { status });
}

// ---- Seats ----

export async function getEventSeats(eventId: string) {
  const { data, error } = await supabase
    .from('seats')
    .select(`
      *,
      section:seating_sections(*),
      row:seating_rows(*)
    `)
    .eq('event_id', eventId);

  if (error) throw error;
  return data;
}

export async function holdSeats(seatIds: string[], userId: string) {
  const holdUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  const { data, error } = await supabase.rpc('hold_seats', {
    p_seat_ids: seatIds,
    p_user_id: userId,
    p_hold_until: holdUntil,
  });

  if (error) throw error;
  return data;
}

export async function releaseSeats(seatIds: string[]) {
  const { error } = await supabase
    .from('seats')
    .update({ status: 'available', held_until: null, held_by: null })
    .in('id', seatIds);

  if (error) throw error;
}

// ---- Ticket Types ----

export async function createTicketType(data: Partial<TicketType>) {
  const { data: ticket, error } = await supabase
    .from('ticket_types')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return ticket as TicketType;
}

export async function updateTicketType(id: string, updates: Partial<TicketType>) {
  const { data, error } = await supabase
    .from('ticket_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TicketType;
}

// ---- Bookings ----

export async function createBooking(bookingData: {
  event_id: string;
  customer_id: string;
  items: Array<{ ticket_type_id: string; quantity: number; unit_price: number }>;
  seat_ids?: string[];
  attendees?: Array<{ first_name: string; last_name: string; email: string; phone?: string }>;
  discount_code?: string;
}) {
  const { data, error } = await supabase.rpc('create_booking', bookingData);
  if (error) throw error;
  return data;
}

export async function getCustomerBookings(customerId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      event:events(id, title, slug, start_date, cover_image_url, location:event_locations(*)),
      items:booking_items(*, ticket_type:ticket_types(*), seats:booking_seats(*, seat:seats(*))),
      payment:payments(*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getOrganizerBookings(organizerId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      event:events!inner(id, title, slug, organizer_id),
      customer:profiles(full_name, email),
      items:booking_items(*, ticket_type:ticket_types(*)),
      payment:payments(*)
    `)
    .eq('events.organizer_id', organizerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getBookingById(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      event:events(*),
      customer:profiles(*),
      items:booking_items(*, ticket_type:ticket_types(*), seats:booking_seats(*, seat:seats(*))),
      payment:payments(*),
      invoice:invoices(*),
      tickets(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ---- Event Sections ----

export async function getEventSections(eventId: string) {
  const { data, error } = await supabase
    .from('seating_sections')
    .select(`
      *,
      rows:seating_rows(*, seats(*))
    `)
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createSection(data: {
  event_id: string;
  name: string;
  label?: string;
  color: string;
  seat_type: string;
  capacity: number;
  sort_order: number;
}) {
  const { data: section, error } = await supabase
    .from('seating_sections')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return section;
}

// ---- Profiles ----

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---- Event Location ----

export async function upsertEventLocation(data: Partial<EventLocation> & { event_id: string }) {
  const { data: location, error } = await supabase
    .from('event_locations')
    .upsert(data, { onConflict: 'event_id' })
    .select()
    .single();

  if (error) throw error;
  return location;
}

// ---- Event Speakers ----

export async function upsertSpeakers(eventId: string, speakers: Partial<EventSpeaker>[]) {
  // Delete existing then re-insert
  await supabase.from('event_speakers').delete().eq('event_id', eventId);
  if (speakers.length === 0) return [];

  const { data, error } = await supabase
    .from('event_speakers')
    .insert(speakers.map((s, i) => ({ ...s, event_id: eventId, sort_order: i })))
    .select();

  if (error) throw error;
  return data;
}

// ---- Event Schedule ----

export async function upsertSchedule(eventId: string, items: Partial<EventScheduleItem>[]) {
  await supabase.from('event_schedules').delete().eq('event_id', eventId);
  if (items.length === 0) return [];

  const { data, error } = await supabase
    .from('event_schedules')
    .insert(items.map((s, i) => ({ ...s, event_id: eventId, sort_order: i })))
    .select();

  if (error) throw error;
  return data;
}

// ---- Stats / Dashboard ----

export async function getOrganizerDashboardStats(organizerId: string) {
  const { data, error } = await supabase.rpc('get_organizer_stats', {
    p_organizer_id: organizerId,
  });
  if (error) throw error;
  return data;
}

export async function getEventStats(eventId: string) {
  const { data, error } = await supabase.rpc('get_event_stats', {
    p_event_id: eventId,
  });
  if (error) throw error;
  return data;
}

// ---- Tickets / Check-in ----

export async function getMyTickets(customerId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events(id, title, slug, start_date, cover_image_url),
      seat:seats(label, section:seating_sections(name))
    `)
    .eq('booking.customer_id', customerId);

  if (error) throw error;
  return data;
}

export async function checkinTicket(ticketCode: string, staffId: string) {
  const { data, error } = await supabase.rpc('checkin_ticket', {
    p_ticket_code: ticketCode,
    p_staff_id: staffId,
  });
  if (error) throw error;
  return data;
}

// ---- Admin ----

export async function getAdminStats() {
  const { data, error } = await supabase.rpc('get_admin_stats');
  if (error) throw error;
  return data;
}

export async function getAdminUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAdminEvents() {
  const { data, error } = await supabase
    .from('events')
    .select(`*, organizer:profiles(full_name, email)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ---- Categories ----

export async function getCategories() {
  const { data, error } = await supabase
    .from('event_categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}
