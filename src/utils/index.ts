import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'MMMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatDateTime(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy • h:mm a');
}

export function formatTime(time: string) {
  // time = "HH:MM"
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function timeAgo(date: string) {
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
  return `AVL-${year}-${num}`;
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.substring(0, n - 1) + '...' : str;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  concert: 'Concert',
  conference: 'Conference',
  symposium: 'Symposium',
  seminar: 'Seminar',
  workshop: 'Workshop',
  corporate: 'Corporate',
  university: 'University',
  award_ceremony: 'Award Ceremony',
  exhibition: 'Exhibition',
  networking: 'Networking',
  cultural: 'Cultural',
  sports: 'Sports',
  community: 'Community',
  private: 'Private',
  other: 'Other',
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  paused: 'Paused',
  sold_out: 'Sold Out',
  closed: 'Closed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-600',
  published: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  sold_out: 'bg-orange-100 text-orange-700',
  closed: 'bg-neutral-200 text-neutral-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

export const CURRENCIES = [
  { code: 'USD', label: 'US Dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'INR', label: 'Indian Rupee' },
  { code: 'LKR', label: 'Sri Lankan Rupee' },
  { code: 'SGD', label: 'Singapore Dollar' },
  { code: 'AED', label: 'UAE Dirham' },
  { code: 'JPY', label: 'Japanese Yen' },
];

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Colombo', label: 'Sri Lanka (SLT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];
