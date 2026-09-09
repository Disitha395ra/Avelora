-- ============================================================
-- AVELORA — DATABASE MIGRATION 001: INITIAL SCHEMA
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  country TEXT,
  organization TEXT,
  role TEXT NOT NULL DEFAULT 'customer'
    CHECK (role IN ('platform_admin', 'event_organizer', 'customer', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENT CATEGORIES
-- ============================================================
CREATE TABLE event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES event_categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('concert','conference','symposium','seminar','workshop',
      'corporate','university','award_ceremony','exhibition','networking',
      'cultural','sports','community','private','other')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','paused','sold_out','closed','cancelled','completed')),
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  access_code TEXT,
  cover_image_url TEXT,
  organizer_name TEXT,
  organizer_logo_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '17:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  venue_type TEXT NOT NULL DEFAULT 'physical'
    CHECK (venue_type IN ('physical','online','hybrid')),
  seating_type TEXT NOT NULL DEFAULT 'general_admission'
    CHECK (seating_type IN ('general_admission','reserved','table','custom')),
  max_capacity INTEGER,
  booking_deadline TIMESTAMPTZ,
  allow_cancellations BOOLEAN NOT NULL DEFAULT TRUE,
  refund_policy TEXT,
  terms_and_conditions TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_start_date ON events(start_date);

-- ============================================================
-- EVENT LOCATIONS
-- ============================================================
CREATE TABLE event_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  venue_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  online_url TEXT,
  online_platform TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENT SCHEDULES
-- ============================================================
CREATE TABLE event_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  speaker_id UUID,
  track TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENT SPEAKERS
-- ============================================================
CREATE TABLE event_speakers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  bio TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENT SETTINGS (extra key-value config)
-- ============================================================
CREATE TABLE event_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  show_remaining_capacity BOOLEAN DEFAULT TRUE,
  enable_waitlist BOOLEAN DEFAULT FALSE,
  custom_fields JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENT STAFF
-- ============================================================
CREATE TABLE event_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  invited_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined')),
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, invited_email)
);

-- ============================================================
-- SEATING SECTIONS
-- ============================================================
CREATE TABLE seating_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT,
  color TEXT NOT NULL DEFAULT '#c9a84c',
  seat_type TEXT NOT NULL DEFAULT 'regular'
    CHECK (seat_type IN ('regular','vip','premium','accessible','table','general_admission')),
  price_override NUMERIC(10,2),
  capacity INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sections_event ON seating_sections(event_id);

-- ============================================================
-- SEATING ROWS
-- ============================================================
CREATE TABLE seating_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES seating_sections(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEATS
-- ============================================================
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES seating_sections(id) ON DELETE CASCADE,
  row_id UUID REFERENCES seating_rows(id),
  label TEXT NOT NULL,
  row_label TEXT,
  seat_number TEXT,
  seat_type TEXT NOT NULL DEFAULT 'regular'
    CHECK (seat_type IN ('regular','vip','premium','accessible','table','general_admission')),
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available','held','booked','blocked')),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  held_until TIMESTAMPTZ,
  held_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seats_event ON seats(event_id);
CREATE INDEX idx_seats_status ON seats(status);
CREATE INDEX idx_seats_section ON seats(section_id);

-- ============================================================
-- TICKET TYPES
-- ============================================================
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  quantity INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_quantity CHECK (quantity_sold <= quantity)
);

CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference TEXT NOT NULL UNIQUE,
  event_id UUID NOT NULL REFERENCES events(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','cancelled','refunded','expired')),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  fees NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_event ON bookings(event_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

-- ============================================================
-- BOOKING ITEMS
-- ============================================================
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BOOKING SEATS
-- ============================================================
CREATE TABLE booking_seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  booking_item_id UUID NOT NULL REFERENCES booking_items(id),
  seat_id UUID NOT NULL REFERENCES seats(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(seat_id, booking_id)
);

-- ============================================================
-- ATTENDEES
-- ============================================================
CREATE TABLE attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  booking_item_id UUID NOT NULL REFERENCES booking_items(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_payment_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','paid','failed','refunded','cancelled')),
  metadata JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'issued',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TICKETS (digital tickets)
-- ============================================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_code TEXT NOT NULL UNIQUE,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  booking_item_id UUID NOT NULL REFERENCES booking_items(id),
  attendee_id UUID REFERENCES attendees(id),
  seat_id UUID REFERENCES seats(id),
  event_id UUID NOT NULL REFERENCES events(id),
  status TEXT NOT NULL DEFAULT 'valid'
    CHECK (status IN ('valid','used','cancelled','invalid')),
  qr_data TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_booking ON tickets(booking_id);
CREATE INDEX idx_tickets_code ON tickets(ticket_code);
CREATE INDEX idx_tickets_event ON tickets(event_id);

-- ============================================================
-- TICKET CHECKINS
-- ============================================================
CREATE TABLE ticket_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  checked_in_by UUID NOT NULL REFERENCES profiles(id),
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT,
  UNIQUE(ticket_id)  -- prevent duplicate check-in
);

-- ============================================================
-- REFUNDS
-- ============================================================
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  payment_id UUID NOT NULL REFERENCES payments(id),
  amount NUMERIC(10,2) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','processed')),
  provider_refund_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DISCOUNT CODES
-- ============================================================
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, code)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
