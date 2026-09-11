import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, Lock, User } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils';
import toast from 'react-hot-toast';
import { cn } from '@/utils';

import { SeatingMap } from '@/components/booking/SeatingMap';
// MOCK removed


export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const event = location.state?.event;
  const quantities = location.state?.quantities || {};

  // Extract selected tickets from event.ticket_types based on quantities
  const selectedTickets = event?.ticket_types
    ?.filter((t: any) => quantities[t.id] > 0)
    ?.map((t: any) => ({ ...t, quantity: quantities[t.id] })) || [];

  useEffect(() => {
    if (!event || (selectedTickets.length === 0 && event?.seating_type !== 'reserved')) {
      navigate('/discover');
    }
  }, [event, navigate, selectedTickets]);

  const STEPS = event?.seating_type === 'reserved' 
    ? ['Select Seats', 'Details', 'Payment', 'Confirmation']
    : ['Details', 'Payment', 'Confirmation'];

  const [step, setStep] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);

  const [processing, setProcessing] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // If reserved seating, use seat prices; otherwise use ticket type prices
  const isReserved = event?.seating_type === 'reserved';
  
  const subtotal = isReserved 
    ? selectedSeats.reduce((s: number, seat: any) => s + seat.price, 0)
    : selectedTickets.reduce((s: number, t: any) => s + t.price * t.quantity, 0);

  const fees = Math.round(subtotal * 0.03 * 100) / 100;
  const total = subtotal + fees;

  // Attendee form state
  const [attendees, setAttendees] = useState<any[]>([]);

  useEffect(() => {
    if (isReserved) {
      setAttendees(
        selectedSeats.map((s: any) => ({
          first_name: '', last_name: '', email: '', phone: '', seat_id: s.id, ticket_type_id: event?.ticket_types[0]?.id 
        }))
      );
    } else {
      setAttendees(
        selectedTickets.flatMap((t: any) =>
          Array.from({ length: t.quantity }, () => ({ 
            first_name: '', last_name: '', email: '', phone: '', ticket_type_id: t.id 
          }))
        )
      );
    }
  }, [selectedSeats, selectedTickets, isReserved, event]);

  const updateAttendee = (i: number, field: string, value: string) => {
    setAttendees((prev: any[]) => prev.map((a: any, idx: number) => idx === i ? { ...a, [field]: value } : a));
  };

  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });

  const handlePayment = async () => {
    if (!user) {
      toast.error('You must be logged in to book tickets.');
      navigate('/login');
      return;
    }
    
    setProcessing(true);
    
    try {
      const items = isReserved && event?.ticket_types?.length > 0
        ? [{ ticket_type_id: event.ticket_types[0].id, quantity: selectedSeats.length }]
        : selectedTickets.map((t: any) => ({
            ticket_type_id: t.id,
            quantity: t.quantity
          }));

      // Call RPC to create booking securely
      const { data: result, error: rpcError } = await supabase.rpc('create_booking', {
        p_event_id: event.id,
        p_customer_id: user.id,
        p_items: items,
        p_seat_ids: isReserved ? selectedSeats.map(s => s.id) : undefined
      });

      if (rpcError) throw rpcError;

      // Now insert attendees
      // 1. Get the created booking_items to map attendees to booking_item_id
      const { data: bookingItems } = await supabase
        .from('booking_items')
        .select('id, ticket_type_id')
        .eq('booking_id', result.booking_id);

      if (bookingItems) {
        const attendeesToInsert = attendees.map((a: any) => {
          // find matching booking_item for this ticket_type_id
          const bItem = bookingItems.find(b => b.ticket_type_id === a.ticket_type_id);
          return {
            booking_id: result.booking_id,
            booking_item_id: bItem?.id || bookingItems[0]?.id,
            first_name: a.first_name,
            last_name: a.last_name,
            email: a.email,
            phone: a.phone
          };
        });

        await supabase.from('attendees').insert(attendeesToInsert);
      }

      setBookingRef(result.booking_reference);
      setStep(isReserved ? 3 : 2);
      toast.success('Payment successful! 🎉');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to process booking');
    } finally {
      setProcessing(false);
    }
  };

  if (!event || (selectedTickets.length === 0 && event?.seating_type !== 'reserved')) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Back */}
          <Link
            to={`/event/${event.slug}`}
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to event
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium',
                  i < step ? 'text-green-700 bg-green-50 border border-green-200' :
                  i === step ? 'text-white bg-neutral-900' : 'text-neutral-400 bg-neutral-100'
                )}>
                  {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  {s}
                </div>
                {i < STEPS.length - 1 && <div className={cn('w-8 h-px', i < step ? 'bg-green-300' : 'bg-neutral-200')} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              {/* Step: Select Seats (if reserved) */}
              {isReserved && step === 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-500" /> Select Seats
                  </h2>
                  <p className="text-sm text-neutral-500 mb-6">Choose your seats from the map below.</p>
                  
                  <SeatingMap eventId={event.id} onSeatSelect={setSelectedSeats} />

                  <Button
                    fullWidth
                    size="lg"
                    className="mt-6"
                    onClick={() => setStep(1)}
                    disabled={selectedSeats.length === 0}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Continue to Details
                  </Button>
                </div>
              )}

              {/* Step: Attendee details */}
              {((isReserved && step === 1) || (!isReserved && step === 0)) && (
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-500" /> Attendee Details
                  </h2>
                  <p className="text-sm text-neutral-500 mb-6">Please enter details for each ticket.</p>

                  <div className="space-y-6">
                    {attendees.map((a: any, i: number) => (
                      <div key={i} className="p-5 border border-neutral-200 rounded-xl">
                        <p className="text-sm font-semibold text-neutral-700 mb-4 flex justify-between">
                          <span>Attendee {i + 1}</span>
                          {isReserved && <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full text-xs">Seat: {selectedSeats[i]?.label}</span>}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="First Name"
                            placeholder="Jane"
                            value={a.first_name}
                            onChange={e => updateAttendee(i, 'first_name', e.target.value)}
                            required
                          />
                          <Input
                            label="Last Name"
                            placeholder="Smith"
                            value={a.last_name}
                            onChange={e => updateAttendee(i, 'last_name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <Input
                            label="Email"
                            type="email"
                            placeholder="jane@example.com"
                            value={a.email}
                            onChange={e => updateAttendee(i, 'email', e.target.value)}
                            required
                          />
                          <Input
                            label="Phone (optional)"
                            type="tel"
                            placeholder="+1 555 000 0000"
                            value={a.phone}
                            onChange={e => updateAttendee(i, 'phone', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    fullWidth
                    size="lg"
                    className="mt-6"
                    onClick={() => setStep(isReserved ? 2 : 1)}
                    disabled={attendees.some((a: any) => !a.first_name || !a.last_name || !a.email)}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Continue to Payment
                  </Button>
                </div>
              )}

              {/* Step: Payment */}
              {((isReserved && step === 2) || (!isReserved && step === 1)) && (
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-500" /> Payment
                  </h2>
                  <p className="text-sm text-neutral-500 mb-6">Your payment is secured by Stripe.</p>

                  <div className="space-y-4">
                    <Input
                      label="Cardholder Name"
                      placeholder="Jane Smith"
                      value={cardData.name}
                      onChange={e => setCardData(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                    <Input
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={e => setCardData(p => ({ ...p, number: e.target.value }))}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Expiry"
                        placeholder="MM / YY"
                        value={cardData.expiry}
                        onChange={e => setCardData(p => ({ ...p, expiry: e.target.value }))}
                        required
                      />
                      <Input
                        label="CVC"
                        placeholder="123"
                        value={cardData.cvc}
                        onChange={e => setCardData(p => ({ ...p, cvc: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                    <Lock className="w-4 h-4 text-green-500 shrink-0" />
                    <p className="text-xs text-neutral-500">256-bit SSL encryption. Your card details are never stored on our servers.</p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => setStep(isReserved ? 1 : 0)} icon={<ArrowLeft className="w-4 h-4" />}>
                      Back
                    </Button>
                    <Button
                      fullWidth
                      size="lg"
                      onClick={handlePayment}
                      loading={processing}
                      disabled={!cardData.name || !cardData.number || !cardData.expiry || !cardData.cvc}
                    >
                      Pay {formatCurrency(total, event.currency)}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step: Confirmation */}
              {((isReserved && step === 3) || (!isReserved && step === 2)) && (
                <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">Booking Confirmed! 🎉</h2>
                  <p className="text-neutral-500 mb-6">
                    Your tickets have been booked and a confirmation email has been sent.
                  </p>

                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl mb-8 inline-block">
                    <p className="text-xs text-neutral-500 mb-1">Booking Reference</p>
                    <p className="text-xl font-bold font-mono text-neutral-900">{bookingRef}</p>
                  </div>

                  <div className="space-y-2 text-left mb-8 max-w-sm mx-auto">
                    {[
                      'Confirmation email sent to attendees',
                      'Digital tickets attached to email',
                      'Add to calendar available',
                      'QR codes ready for check-in',
                    ].map(feat => (
                      <div key={feat} className="flex items-center gap-2 text-sm text-neutral-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline">Download Invoice</Button>
                    <Link to="/my/tickets">
                      <Button>View My Tickets</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Order summary */}
            <div>
              <div className="bg-white border border-neutral-200 rounded-xl p-5 sticky top-20">
                <h3 className="font-semibold text-neutral-900 mb-4">Order Summary</h3>

                <div className="mb-4 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-sm font-semibold text-neutral-900">{event.title}</p>
                  <p className="text-xs text-neutral-500 mt-1">{new Date(event.start_date).toLocaleDateString()}</p>
                  <p className="text-xs text-neutral-500">{event.venue_type === 'online' ? 'Online' : event.location?.city}</p>
                </div>

                <div className="space-y-2 mb-4">
                  {isReserved ? (
                    selectedSeats.map((s: any) => (
                      <div key={s.id} className="flex justify-between text-sm">
                        <span className="text-neutral-600">Seat {s.label}</span>
                        <span className="font-medium">{formatCurrency(s.price, event.currency)}</span>
                      </div>
                    ))
                  ) : (
                    selectedTickets.map((t: any) => (
                      <div key={t.name} className="flex justify-between text-sm">
                        <span className="text-neutral-600">{t.name} × {t.quantity}</span>
                        <span className="font-medium">{formatCurrency(t.price * t.quantity, event.currency)}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-neutral-200 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, event.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Platform fee (3%)</span>
                    <span>{formatCurrency(fees, event.currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                    <span>Total</span>
                    <span>{formatCurrency(total, event.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
