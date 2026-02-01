import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Eye, EyeOff, Loader2, CheckCircle2, Sparkles, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { getEdgeFunctionHumanMessage } from '@/lib/edgeFunctionError';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
});

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const isSignUp = searchParams.get('mode') === 'signup';
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>(isSignUp ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (user) {
      // Check for redirect URL in search params
      const redirectUrl = searchParams.get('redirect');
      const planId = searchParams.get('plan');
      
      if (redirectUrl) {
        // Append plan param if present
        const finalUrl = planId ? `${redirectUrl}?plan=${planId}` : redirectUrl;
        navigate(finalUrl, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate, searchParams]);

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const validateForm = () => {
    try {
      authSchema.parse({ email, password, fullName: mode === 'signup' ? fullName : undefined });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        // Trigger shake animation
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Please login instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }
        toast({
          title: 'Welcome!',
          description: 'Your account has been created successfully.',
        });
        // Redirect handled by useEffect above
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login failed',
            description: 'Invalid email or password. Please try again.',
            variant: 'destructive',
          });
          setShake(true);
          setTimeout(() => setShake(false), 500);
          return;
        }
        toast({
          title: 'Welcome back!',
          description: 'You have logged in successfully.',
        });
        // Redirect handled by useEffect above
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsFacebookLoading(true);
    try {
      // Get the Facebook login URL from edge function
      const { data, error } = await supabase.functions.invoke('facebook-auth-login', {
        body: { action: 'get-login-url' },
      });

      // Check for configuration error
      if (error || data?.error || !data?.authUrl) {
        const errorData = data?.error || {};
        const human = getEdgeFunctionHumanMessage(error, data, 'Facebook login unavailable');
        toast({
          title: errorData.human_message || human,
          description: errorData.fix_steps?.[0] || 'Please contact support or use email login.',
          variant: 'destructive',
        });
        return;
      }

      // Store OAuth state in localStorage so the popup callback window can validate it
      try {
        if (data?.state) {
          localStorage.setItem('fb_login_oauth_state', data.state);
        }
      } catch {
        // ignore
      }

      // Open popup for Facebook OAuth
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        data.authUrl,
        'facebook-login',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for message from popup
      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'fb-login-success') {
          window.removeEventListener('message', handleMessage);
          popup?.close();

           // Complete login with the received user data
           // NOTE: edge function requires an explicit action, otherwise it returns INVALID_ACTION (non-2xx)
           const { data: loginResult, error: loginError } = await supabase.functions.invoke('facebook-auth-login', {
             body: { action: 'complete-login', ...event.data.userData },
           });

          if (loginError || !loginResult?.success) {
            const message = getEdgeFunctionHumanMessage(
              loginError,
              loginResult,
              'Could not complete Facebook login.'
            );
            toast({
              title: 'Login failed',
              description: message,
              variant: 'destructive',
            });
            return;
          }

          // Sign in using magic link token
          if (loginResult.properties?.hashed_token) {
            const { error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: loginResult.properties.hashed_token,
              type: 'magiclink',
            });

            if (verifyError) {
              toast({
                title: 'Login failed',
                description: 'Could not verify login. Please try again.',
                variant: 'destructive',
              });
              return;
            }
          }

          toast({
            title: loginResult.isNewUser ? 'Welcome!' : 'Welcome back!',
            description: loginResult.isNewUser 
              ? 'Your account has been created with Facebook.' 
              : 'Logged in successfully with Facebook.',
          });
          navigate('/dashboard');
        } else if (event.data?.type === 'fb-login-error') {
          window.removeEventListener('message', handleMessage);
          popup?.close();
          toast({
            title: 'Facebook login failed',
            description: event.data.error || 'Please try again.',
            variant: 'destructive',
          });
        }
      };

      window.addEventListener('message', handleMessage);

      // Cleanup listener if popup is closed manually
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', handleMessage);
          setIsFacebookLoading(false);
        }
      }, 500);

    } catch (error) {
      console.error('Facebook login error:', error);
      toast({
        title: 'Facebook login failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const benefits = [
    'Instant page health score',
    'Engagement rate analysis',
    'Content recommendations',
    'Export professional reports',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl mb-8 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-200 group-hover:scale-105">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span>Pagelyzer</span>
          </Link>

          {/* Header with transition */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2 transition-all duration-300">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-muted-foreground transition-all duration-300">
              {mode === 'login'
                ? 'Enter your credentials to access your dashboard'
                : 'Start auditing your Facebook pages for free'}
            </p>
          </div>

          {/* Form with shake animation */}
          <form 
            onSubmit={handleSubmit} 
            className={cn(
              'space-y-5 transition-transform duration-100',
              shake && 'animate-[shake_0.5s_ease-in-out]'
            )}
          >
            {/* Name field with slide animation */}
            <div className={cn(
              'space-y-2 transition-all duration-300 overflow-hidden',
              mode === 'signup' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
            )}>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                className="transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                disabled={isLoading}
                error={!!errors.email}
                className="transition-all duration-200"
              />
              {errors.email && (
                <p className="text-sm text-destructive animate-fade-in">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  disabled={isLoading}
                  error={!!errors.password}
                  className="pr-10 transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive animate-fade-in">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || isFacebookLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>{mode === 'login' ? 'Sign in' : 'Create account'}</>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Facebook Login Button */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={handleFacebookLogin}
            disabled={isLoading || isFacebookLoading}
          >
            {isFacebookLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Facebook className="h-4 w-4 text-[#1877F2]" />
            )}
            Continue with Facebook
          </Button>

          {/* Toggle mode */}
          <div className="mt-6 text-center text-sm">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Decorative with animations */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-primary">
        {/* Animated background shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/10 animate-float" />
        <div className="absolute bottom-32 right-20 w-24 h-24 rounded-2xl bg-white/10 animate-float stagger-2" />
        <div className="absolute top-1/2 left-10 w-16 h-16 rounded-lg bg-white/5 animate-float stagger-3" />
        
        <div className="max-w-md text-primary-foreground relative z-10 px-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mb-8 animate-bounce-soft">
            <BarChart3 className="h-8 w-8" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4 animate-fade-in">
            Audit Your Facebook Page in Minutes
          </h2>
          <p className="text-lg opacity-90 mb-8 animate-fade-in stagger-1">
            Get detailed insights, engagement analysis, and AI-powered 
            recommendations to grow your audience.
          </p>
          
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit}
                className={cn(
                  'flex items-center gap-3 animate-fade-in',
                  `stagger-${index + 2}`
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="opacity-90">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Decorative sparkle */}
          <div className="absolute bottom-0 right-0 opacity-20">
            <Sparkles className="h-32 w-32" />
          </div>
        </div>
      </div>

      {/* Shake animation keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
