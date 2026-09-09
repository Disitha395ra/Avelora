import { z } from 'zod';

// ---- Auth ----

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

// ---- Event Wizard ----

export const step1Schema = z.object({
  title: z.string().min(3, 'Event name must be at least 3 characters').max(120),
  event_type: z.string().min(1, 'Please select an event type'),
  short_description: z.string().min(10, 'Short description required').max(300),
  description: z.string().min(20, 'Please provide a full description'),
  organizer_name: z.string().min(2, 'Organizer name is required'),
});

export const step2Schema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_date: z.string().min(1, 'End date is required'),
  end_time: z.string().min(1, 'End time is required'),
  timezone: z.string().min(1, 'Timezone is required'),
});

export const step3Schema = z.object({
  venue_type: z.enum(['physical', 'online', 'hybrid']),
  venue_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  online_url: z.string().url().optional().or(z.literal('')),
});

export const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket name required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  sale_start: z.string().optional(),
  sale_end: z.string().optional(),
});

export const step5Schema = z.object({
  ticket_types: z.array(ticketTypeSchema).min(1, 'Add at least one ticket type'),
  currency: z.string().min(1, 'Currency is required'),
});

export const step6Schema = z.object({
  contact_email: z.string().email('Valid contact email required'),
  contact_phone: z.string().optional(),
  refund_policy: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  allow_cancellations: z.boolean(),
  is_private: z.boolean(),
});

// ---- Attendee Form ----

export const attendeeSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  organization: z.string().optional(),
});

// ---- Profile Update ----

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name required'),
  phone: z.string().optional(),
  country: z.string().optional(),
  organization: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AttendeeFormData = z.infer<typeof attendeeSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
