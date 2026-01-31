import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * Facebook Login OAuth Callback Handler
 * 
 * This component handles the OAuth callback from Facebook after user authentication.
 * It reads the authorization code from URL params, exchanges it for user data,
 * and communicates the result back to the opener window via postMessage.
 */
export default function FacebookLoginCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const returnedState = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Validate OAuth state (CSRF protection)
      try {
        const storedState = localStorage.getItem('fb_login_oauth_state');
        if (returnedState && storedState && returnedState !== storedState) {
          const message = 'Invalid login state. Please try again.';
          setStatus('error');
          setErrorMessage(message);
          if (window.opener) {
            window.opener.postMessage({ type: 'fb-login-error', error: message }, '*');
            setTimeout(() => window.close(), 1500);
          }
          return;
        }
        // Clear after use
        if (storedState) localStorage.removeItem('fb_login_oauth_state');
      } catch {
        // ignore
      }

      // Handle Facebook error response
      if (error) {
        const message = errorDescription || error;
        setStatus('error');
        setErrorMessage(message);
        
        if (window.opener) {
          window.opener.postMessage({ type: 'fb-login-error', error: message }, '*');
          setTimeout(() => window.close(), 1500);
        }
        return;
      }

      // No code received
      if (!code) {
        const message = 'No authorization code received from Facebook';
        setStatus('error');
        setErrorMessage(message);
        
        if (window.opener) {
          window.opener.postMessage({ type: 'fb-login-error', error: message }, '*');
          setTimeout(() => window.close(), 1500);
        }
        return;
      }

      try {
        const redirectUri = `${window.location.origin}${window.location.pathname}`;
        // Call the edge function to exchange code for user data
        const { data, error: fnError } = await supabase.functions.invoke('facebook-auth-login', {
          body: { action: 'exchange-code', code, redirect_uri: redirectUri },
        });

        if (fnError || !data?.success) {
          const message = data?.error?.human_message || fnError?.message || 'Failed to authenticate with Facebook';
          setStatus('error');
          setErrorMessage(message);
          
          if (window.opener) {
            window.opener.postMessage({ type: 'fb-login-error', error: message }, '*');
            setTimeout(() => window.close(), 1500);
          }
          return;
        }

        // Success - send user data to opener
        setStatus('success');
        
        if (window.opener) {
          window.opener.postMessage({
            type: 'fb-login-success',
            userData: data.userData,
          }, '*');
          setTimeout(() => window.close(), 500);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setStatus('error');
        setErrorMessage(message);
        
        if (window.opener) {
          window.opener.postMessage({ type: 'fb-login-error', error: message }, '*');
          setTimeout(() => window.close(), 1500);
        }
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center p-8">
        {status === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Completing Facebook login...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="h-8 w-8 rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-foreground">Login successful!</p>
            <p className="text-sm text-muted-foreground mt-1">This window will close automatically.</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="h-8 w-8 rounded-full bg-destructive mx-auto mb-4 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-foreground font-medium">Login failed</p>
            <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
            {!window.opener && (
              <a href="/auth" className="text-primary underline text-sm mt-4 block">
                Return to login
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
