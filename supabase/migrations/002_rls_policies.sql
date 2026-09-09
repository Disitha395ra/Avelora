-- ============================================================
-- AVELORA — MIGRATION 002: RLS POLICIES + TRIGGERS + FUNCTIONS
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is owner of an event
CREATE OR REPLACE FUNCTION is_event_owner(p_event_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM events WHERE id = p_event_id AND organizer_id = auth.uid());
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is staff of an event
CREATE OR REPLACE FUNCTION is_event_staff(p_event_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM event_staff
    WHERE event_id = p_event_id
    AND user_id = auth.uid()
    AND status = 'accepted'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES RLS
-- ============================================================
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (is_platform_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_platform_admin());

-- Auto-create profile on signup (via trigger)
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- EVENT CATEGORIES RLS (public read)
-- ============================================================
CREATE POLICY "Anyone can read categories" ON event_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON event_categories
  FOR ALL USING (is_platform_admin());

-- ============================================================
-- EVENTS RLS
-- ============================================================

-- Public can read published non-private events
CREATE POLICY "Public can read published events" ON events
  FOR SELECT USING (
    status = 'published' AND is_private = FALSE
  );

-- Organizers can read their own events (all statuses)
CREATE POLICY "Organizers can read own events" ON events
  FOR SELECT USING (organizer_id = auth.uid());

-- Admins can read all events
CREATE POLICY "Admins can read all events" ON events
  FOR SELECT USING (is_platform_admin());

-- Organizers can create events
CREATE POLICY "Organizers can create events" ON events
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    organizer_id = auth.uid()
  );

-- Organizers can update their own events
CREATE POLICY "Organizers can update own events" ON events
  FOR UPDATE USING (organizer_id = auth.uid());

-- Admins can update all events
CREATE POLICY "Admins can update all events" ON events
  FOR UPDATE USING (is_platform_admin());

-- Soft delete: only admin can delete
CREATE POLICY "Admins can delete events" ON events
  FOR DELETE USING (is_platform_admin());

-- ============================================================
-- EVENT LOCATIONS RLS
-- ============================================================
CREATE POLICY "Public can read locations of published events" ON event_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_locations.event_id
      AND events.status = 'published'
      AND events.is_private = FALSE
    )
  );

CREATE POLICY "Organizers can manage own event locations" ON event_locations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_locations.event_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Admins can manage all event locations" ON event_locations
  FOR ALL USING (is_platform_admin());

-- ============================================================
-- SEATS RLS
-- ============================================================

-- Public can read seats of published events
CREATE POLICY "Public can read seats of published events" ON seats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = seats.event_id AND events.status = 'published'
    )
  );

-- Organizers can manage seats of own events
CREATE POLICY "Organizers can manage own event seats" ON seats
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = seats.event_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Admins can manage all seats" ON seats
  FOR ALL USING (is_platform_admin());

-- ============================================================
-- TICKET TYPES RLS
-- ============================================================
CREATE POLICY "Public can read ticket types of published events" ON ticket_types
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events WHERE events.id = ticket_types.event_id AND events.status = 'published'
    )
  );

CREATE POLICY "Organizers can manage own ticket types" ON ticket_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = ticket_types.event_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Admins can manage all ticket types" ON ticket_types
  FOR ALL USING (is_platform_admin());

-- ============================================================
-- BOOKINGS RLS
-- ============================================================

-- Customers can read their own bookings
CREATE POLICY "Customers can read own bookings" ON bookings
  FOR SELECT USING (customer_id = auth.uid());

-- Customers can create bookings
CREATE POLICY "Authenticated users can create bookings" ON bookings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND customer_id = auth.uid()
  );

-- Organizers can read bookings for their events
CREATE POLICY "Organizers can read bookings for own events" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = bookings.event_id AND events.organizer_id = auth.uid())
  );

CREATE POLICY "Admins can read all bookings" ON bookings
  FOR SELECT USING (is_platform_admin());

-- ============================================================
-- PAYMENTS RLS
-- ============================================================

-- Customers can read payments for their bookings
CREATE POLICY "Customers can read own payments" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payments.booking_id AND bookings.customer_id = auth.uid())
  );

-- Organizers can read payments for their events
CREATE POLICY "Organizers can read payments for own events" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN events e ON e.id = b.event_id
      WHERE b.id = payments.booking_id AND e.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL USING (is_platform_admin());

-- ============================================================
-- TICKETS RLS
-- ============================================================

-- Customers can read their own tickets
CREATE POLICY "Customers can read own tickets" ON tickets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = tickets.booking_id AND bookings.customer_id = auth.uid())
  );

-- Organizers can read tickets for their events
CREATE POLICY "Organizers can read event tickets" ON tickets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = tickets.event_id AND events.organizer_id = auth.uid())
  );

-- Staff can read and update tickets (for check-in)
CREATE POLICY "Staff can read event tickets" ON tickets
  FOR SELECT USING (is_event_staff(event_id));

CREATE POLICY "Admins can manage all tickets" ON tickets
  FOR ALL USING (is_platform_admin());

-- ============================================================
-- INVOICES RLS
-- ============================================================
CREATE POLICY "Customers can read own invoices" ON invoices
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Organizers can read event invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN events e ON e.id = b.event_id
      WHERE b.id = invoices.booking_id AND e.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all invoices" ON invoices
  FOR ALL USING (is_platform_admin());

-- ============================================================
-- NOTIFICATIONS RLS
-- ============================================================
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- SEATING SECTIONS/ROWS RLS
-- ============================================================
CREATE POLICY "Public can read sections of published events" ON seating_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE id = seating_sections.event_id AND status = 'published')
  );

CREATE POLICY "Organizers can manage own event sections" ON seating_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = seating_sections.event_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Public can read rows of published events" ON seating_rows
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE id = seating_rows.event_id AND status = 'published')
  );

CREATE POLICY "Organizers can manage own event rows" ON seating_rows
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = seating_rows.event_id AND organizer_id = auth.uid())
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at on events
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER seats_updated_at BEFORE UPDATE ON seats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEAT HOLD FUNCTION (prevents race conditions)
-- ============================================================
CREATE OR REPLACE FUNCTION hold_seats(
  p_seat_ids UUID[],
  p_user_id UUID,
  p_hold_until TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Try to hold all seats atomically
  UPDATE seats
  SET status = 'held', held_until = p_hold_until, held_by = p_user_id
  WHERE id = ANY(p_seat_ids)
    AND status = 'available'
    AND (held_until IS NULL OR held_until < NOW());

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- If not all seats were available, rollback
  IF v_count != array_length(p_seat_ids, 1) THEN
    -- Release any seats we just held
    UPDATE seats
    SET status = 'available', held_until = NULL, held_by = NULL
    WHERE id = ANY(p_seat_ids) AND held_by = p_user_id;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RELEASE EXPIRED HOLDS (run periodically)
-- ============================================================
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE seats
  SET status = 'available', held_until = NULL, held_by = NULL
  WHERE status = 'held' AND held_until < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- BOOKING CREATION FUNCTION (transaction-safe)
-- ============================================================
CREATE OR REPLACE FUNCTION create_booking(
  p_event_id UUID,
  p_customer_id UUID,
  p_items JSONB,
  p_seat_ids UUID[] DEFAULT NULL,
  p_discount_code TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_booking bookings;
  v_booking_ref TEXT;
  v_subtotal NUMERIC := 0;
  v_fees NUMERIC := 0;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_booking_item booking_items;
  v_ticket_type ticket_types;
  v_event events;
BEGIN
  -- Check event is published and accepting bookings
  SELECT * INTO v_event FROM events WHERE id = p_event_id;

  IF v_event.status NOT IN ('published') THEN
    RAISE EXCEPTION 'Event is not accepting bookings (status: %)', v_event.status;
  END IF;

  IF v_event.booking_deadline IS NOT NULL AND v_event.booking_deadline < NOW() THEN
    RAISE EXCEPTION 'Booking deadline has passed';
  END IF;

  -- Calculate totals
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_ticket_type FROM ticket_types
    WHERE id = (v_item->>'ticket_type_id')::UUID;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Ticket type not found';
    END IF;

    IF v_ticket_type.quantity_sold + (v_item->>'quantity')::INTEGER > v_ticket_type.quantity THEN
      RAISE EXCEPTION 'Not enough tickets available for %', v_ticket_type.name;
    END IF;

    v_subtotal := v_subtotal + v_ticket_type.price * (v_item->>'quantity')::INTEGER;
  END LOOP;

  v_fees := ROUND(v_subtotal * 0.03, 2);  -- 3% platform fee
  v_total := v_subtotal + v_fees;

  -- Generate booking reference
  v_booking_ref := 'AVL-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
    LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');

  -- Create booking
  INSERT INTO bookings (booking_reference, event_id, customer_id, status, subtotal, fees, total, currency)
  VALUES (v_booking_ref, p_event_id, p_customer_id, 'confirmed', v_subtotal, v_fees, v_total, v_event.currency)
  RETURNING * INTO v_booking;

  -- Create booking items and update ticket quantities
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_ticket_type FROM ticket_types WHERE id = (v_item->>'ticket_type_id')::UUID;

    INSERT INTO booking_items (booking_id, ticket_type_id, quantity, unit_price, subtotal)
    VALUES (
      v_booking.id,
      v_ticket_type.id,
      (v_item->>'quantity')::INTEGER,
      v_ticket_type.price,
      v_ticket_type.price * (v_item->>'quantity')::INTEGER
    )
    RETURNING * INTO v_booking_item;

    -- Update sold count
    UPDATE ticket_types
    SET quantity_sold = quantity_sold + (v_item->>'quantity')::INTEGER
    WHERE id = v_ticket_type.id;
  END LOOP;

  -- Mark seats as booked
  IF p_seat_ids IS NOT NULL THEN
    UPDATE seats
    SET status = 'booked', held_until = NULL, held_by = NULL
    WHERE id = ANY(p_seat_ids) AND (held_by = p_customer_id OR status = 'held');
  END IF;

  RETURN jsonb_build_object(
    'booking_id', v_booking.id,
    'booking_reference', v_booking_ref,
    'total', v_total,
    'currency', v_event.currency,
    'status', 'confirmed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TICKET CHECK-IN FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION checkin_ticket(
  p_ticket_code TEXT,
  p_staff_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_ticket tickets;
BEGIN
  SELECT * INTO v_ticket FROM tickets WHERE ticket_code = p_ticket_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Invalid ticket code');
  END IF;

  IF v_ticket.status = 'used' THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Ticket already used');
  END IF;

  IF v_ticket.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Ticket is cancelled');
  END IF;

  -- Mark ticket as used
  UPDATE tickets SET status = 'used' WHERE id = v_ticket.id;

  -- Record check-in
  INSERT INTO ticket_checkins (ticket_id, checked_in_by)
  VALUES (v_ticket.id, p_staff_id);

  RETURN jsonb_build_object('success', TRUE, 'message', 'Check-in successful', 'ticket_id', v_ticket.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STATS FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION get_organizer_stats(p_organizer_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_events', COUNT(*)::INTEGER,
    'active_events', COUNT(*) FILTER (WHERE status = 'published')::INTEGER,
    'upcoming_events', COUNT(*) FILTER (WHERE status = 'published' AND start_date > CURRENT_DATE)::INTEGER,
    'completed_events', COUNT(*) FILTER (WHERE status IN ('completed', 'closed'))::INTEGER
  ) INTO v_result
  FROM events WHERE organizer_id = p_organizer_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED: EVENT CATEGORIES
-- ============================================================
INSERT INTO event_categories (name, slug, icon) VALUES
  ('Concert', 'concert', 'music'),
  ('Conference', 'conference', 'mic'),
  ('Symposium', 'symposium', 'book-open'),
  ('Workshop', 'workshop', 'layers'),
  ('Seminar', 'seminar', 'presentation'),
  ('Corporate', 'corporate', 'briefcase'),
  ('Exhibition', 'exhibition', 'building'),
  ('Networking', 'networking', 'users'),
  ('University', 'university', 'graduation-cap'),
  ('Award Ceremony', 'award-ceremony', 'trophy'),
  ('Cultural', 'cultural', 'globe'),
  ('Sports', 'sports', 'activity'),
  ('Community', 'community', 'heart'),
  ('Other', 'other', 'star');
