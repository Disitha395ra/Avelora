import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      navigate('/organizer/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      toast.error(message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white" />
          <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full border border-white" />
        </div>
        <div className="relative z-10 text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-12">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-2xl font-bold text-white">Avelora</span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-4">Welcome back.</h2>
          <p className="text-neutral-400 max-w-xs leading-relaxed">
            Sign in to manage your events, track bookings, and connect with your audience.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-center">
            {[
              { value: '50K+', label: 'Events' },
              { value: '2.4M+', label: 'Tickets Sold' },
              { value: '190+', label: 'Countries' },
              { value: '98%', label: 'Satisfaction' },
            ].map((s) => (
              <div key={s.label} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-neutral-900">Avelora</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">Sign in to your account</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 h-10 px-4 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all mb-6 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-neutral-50 text-neutral-400">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="Your password"
                {...register('password')}
                error={errors.password?.message}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-7 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
