import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function PayPalCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const capturePayment = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setErrorMessage('Missing PayPal order token');
        setTimeout(() => {
          navigate('/dashboard/billing?payment=failed&gateway=paypal');
        }, 2000);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('paypal-checkout', {
          body: {
            action: 'capture-order',
            order_id: token,
          },
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error.human_message || 'Payment capture failed');

        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard/billing?payment=success&gateway=paypal');
        }, 1500);
      } catch (err: any) {
        console.error('PayPal capture error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to complete payment');
        setTimeout(() => {
          navigate('/dashboard/billing?payment=failed&gateway=paypal');
        }, 2000);
      }
    };

    capturePayment();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      {status === 'processing' && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Completing your PayPal payment...</p>
          <p className="text-sm text-muted-foreground">Please wait while we confirm your payment.</p>
        </>
      )}
      
      {status === 'success' && (
        <>
          <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
            <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium">Payment Successful!</p>
          <p className="text-sm text-muted-foreground">Redirecting you back...</p>
        </>
      )}
      
      {status === 'error' && (
        <>
          <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
            <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-lg font-medium">Payment Failed</p>
          <p className="text-sm text-muted-foreground">{errorMessage || 'Something went wrong'}</p>
        </>
      )}
    </div>
  );
}
