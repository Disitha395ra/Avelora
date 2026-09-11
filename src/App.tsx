import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/features/auth/AuthContext';
import { useAuth } from '@/features/auth/AuthContext';

// Public pages
import HomePage from '@/pages/public/HomePage';
import DiscoverPage from '@/pages/public/DiscoverPage';
import EventPage from '@/pages/public/EventPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Organizer pages
import { OrganizerLayout } from '@/components/layout/OrganizerLayout';
import OrganizerDashboard from '@/pages/organizer/OrganizerDashboard';
import CreateEventPage from '@/pages/organizer/CreateEventPage';
import MyEventsPage from '@/pages/organizer/MyEventsPage';
import OrganizerBookingsPage from '@/pages/organizer/OrganizerBookingsPage';
import OrganizerReportsPage from '@/pages/organizer/OrganizerReportsPage';
import OrganizerEventDetailPage from '@/pages/organizer/OrganizerEventDetailPage';

// Admin pages
import { AdminLayout } from '@/components/layout/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminEventsPage from '@/pages/admin/AdminEventsPage';
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage';

// Customer pages
import MyBookingsPage from '@/pages/customer/MyBookingsPage';
import MyTicketsPage from '@/pages/customer/MyTicketsPage';

// Booking flow
import BookingPage from '@/pages/booking/BookingPage';

import { LoadingState } from '@/components/ui/States';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
});

function ProtectedRoute({ children, requiredRole }: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { user, profile, loading } = useAuth();
  if (loading) return <LoadingState fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'platform_admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/event/:slug" element={<EventPage />} />
      <Route path="/event/:slug/book" element={<BookingPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<Navigate to="/organizer/dashboard" replace />} />

      {/* Organizer */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute>
            <OrganizerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/organizer/dashboard" replace />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="events" element={<MyEventsPage />} />
        <Route path="events/create" element={<CreateEventPage />} />
        <Route path="events/:id" element={<OrganizerEventDetailPage />} />
        <Route path="bookings" element={<OrganizerBookingsPage />} />
        <Route path="reports" element={<OrganizerReportsPage />} />
        <Route path="attendees" element={<ComingSoon title="Attendees" />} />
        <Route path="tickets" element={<ComingSoon title="Tickets" />} />
        <Route path="payments" element={<ComingSoon title="Payments" />} />
        <Route path="staff" element={<ComingSoon title="Staff Management" />} />
        <Route path="settings" element={<ComingSoon title="Settings" />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="platform_admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="settings" element={<ComingSoon title="Platform Settings" />} />
      </Route>

      {/* Customer */}
      <Route path="/my/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/my/tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
      <Route path="/my/profile" element={<ProtectedRoute><ComingSoon title="Profile Settings" /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      <p className="text-neutral-500 mt-2 text-sm">This section is coming soon.</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-bold text-neutral-200 mb-4">404</h1>
      <p className="text-xl font-semibold text-neutral-900 mb-2">Page not found</p>
      <p className="text-neutral-500 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-brand-600 font-medium hover:underline">← Back to Avelora</a>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                border: '1px solid #e5e2dc',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#2D7D46', secondary: '#fff' } },
              error: { iconTheme: { primary: '#C0392B', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
