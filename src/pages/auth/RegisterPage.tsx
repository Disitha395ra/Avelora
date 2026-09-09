import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const FEATURES = [
  'Create unlimited events',
  'Visual seating map builder',
  'Multi-currency payments',
  'Real-time analytics dashboard',
  'Digital tickets with QR codes',
  'Global attendee management',
];

export default function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.full_name);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Check your email</h1>
          <p className="text-neutral-500 mb-6">
            We've sent a confirmation link to your email address. Click the link to activate your account.
          </p>
          <Link to="/login">
            <Button variant="outline">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-32 left-32 w-72 h-72 rounded-full border border-white" />
          <div className="absolute bottom-24 right-24 w-48 h-48 rounded-full border border-white" />
        </div>
        <div className="relative z-10 w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-2xl font-bold text-white">Avelora</span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-4">Start creating events that matter.</h2>
          <p className="text-neutral-400 mb-10 leading-relaxed">
            Join thousands of organizers who trust Avelora to power their events worldwide.
          </p>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-brand-400" />
                </div>
                <span className="text-sm text-neutral-300">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-neutral-900">Avelora</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">Create your account</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Google */}
          <button
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 h-10 px-4 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all mb-6"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-neutral-50 text-neutral-400">or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full name"
              placeholder="Jane Smith"
              {...register('full_name')}
              error={errors.full_name?.message}
              required
              autoComplete="name"
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
              required
              autoComplete="email"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                {...register('password')}
                error={errors.password?.message}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-7 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              {...register('confirm_password')}
              error={errors.confirm_password?.message}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-neutral-400">
            By creating an account you agree to our{' '}
            <Link to="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
