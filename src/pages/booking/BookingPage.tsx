import { useState } from 'react';

import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, Lock, User } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils';
import toast from 'react-hot-toast';
import { cn } from '@/utils';

const STEPS = ['Details', 'Payment', 'Confirmation'];

// Mock event — would come from URL params
const EVENT = {
  id: '1', slug: 'futuretech-summit-2026', title: 'FutureTech Summit 2026',
  date: 'Mar 12–14, 2026', venue: 'Moscone Center, San Francisco', currency: 'USD',
};

const SELECTED_TICKETS = [
  { name: 'Professional', quantity: 2, price: 399 },
];

export default function BookingPage() {
  const [step, setStep] = useState(0);

  const [processing, setProcessing] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const subtotal = SELECTED_TICKETS.reduce((s, t) => s + t.price * t.quantity, 0);
  const fees = Math.round(subtotal * 0.03 * 100) / 100;
  const total = subtotal + fees;

  // Attendee form state
  const [attendees, setAttendees] = useState(
    SELECTED_TICKETS.flatMap(t =>
      Array.from({ length: t.quantity }, () => ({ first_name: '', last_name: '', email: '', phone: '' }))
    )
  );

  const updateAttendee = (i: number, field: string, value: string) => {
    setAttendees(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a));
  };

  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    const ref = `AVL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
    setBookingRef(ref);
    setStep(2);
    setProcessing(false);
    toast.success('Payment successful! 🎉');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Back */}
          <Link
            to={`/event/${EVENT.slug}`}
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
              {/* Step 0: Attendee details */}
              {step === 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-500" /> Attendee Details
                  </h2>
                  <p className="text-sm text-neutral-500 mb-6">Please enter details for each ticket.</p>

                  <div className="space-y-6">
                    {attendees.map((a, i) => (
                      <div key={i} className="p-5 border border-neutral-200 rounded-xl">
                        <p className="text-sm font-semibold text-neutral-700 mb-4">
                          Attendee {i + 1} — {SELECTED_TICKETS[0].name}
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
                    onClick={() => setStep(1)}
                    disabled={attendees.some(a => !a.first_name || !a.last_name || !a.email)}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Continue to Payment
                  </Button>
                </div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
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
                    <Button variant="outline" onClick={() => setStep(0)} icon={<ArrowLeft className="w-4 h-4" />}>
                      Back
                    </Button>
                    <Button
                      fullWidth
                      size="lg"
                      onClick={handlePayment}
                      loading={processing}
                      disabled={!cardData.name || !cardData.number || !cardData.expiry || !cardData.cvc}
                    >
                      Pay {formatCurrency(total, EVENT.currency)}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Confirmation */}
              {step === 2 && (
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
                  <p className="text-sm font-semibold text-neutral-900">{EVENT.title}</p>
                  <p className="text-xs text-neutral-500 mt-1">{EVENT.date}</p>
                  <p className="text-xs text-neutral-500">{EVENT.venue}</p>
                </div>

                <div className="space-y-2 mb-4">
                  {SELECTED_TICKETS.map(t => (
                    <div key={t.name} className="flex justify-between text-sm">
                      <span className="text-neutral-600">{t.name} × {t.quantity}</span>
                      <span className="font-medium">{formatCurrency(t.price * t.quantity, EVENT.currency)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-200 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, EVENT.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Platform fee (3%)</span>
                    <span>{formatCurrency(fees, EVENT.currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                    <span>Total</span>
                    <span>{formatCurrency(total, EVENT.currency)}</span>
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
