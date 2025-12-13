import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { Loader } from 'lucide-react';

/**
 * OAuth Callback Handler
 * 
 * This page handles the redirect from Google OAuth/Supabase after authentication
 * 
 * Flow:
 * 1. User clicks "Sign in with Google"
 * 2. Google redirects to: https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback?code=xxx
 * 3. Supabase handles the token exchange and redirects to: https://tradeone.vercel.app/auth/callback
 * 4. This component checks if session exists
 * 5. If yes → redirect to dashboard
 * 6. If no → redirect to login
 */
export function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if this is an email verification (contains tokens in URL)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        const hasTokens = 
          hashParams.has('access_token') || 
          hashParams.has('refresh_token') ||
          searchParams.has('token') ||
          searchParams.has('type');

        if (hasTokens) {
          // Email verification - Supabase will auto-handle it
          console.log('Processing email verification...');
          
          // Wait a bit longer for email verification
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Get the session that was just created by Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          // ✅ Session established successfully
          console.log('Authentication successful');
          setSuccess(true);
          
          // Show success message briefly before redirect
          setTimeout(() => {
            navigate('/dashboard/journal', { replace: true });
          }, 1000);
        } else {
          // ⚠️ No session found - redirect back to login
          console.warn('No session found after OAuth callback');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 1500);
        }
      } catch (err) {
        // ❌ Error during authentication
        const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
        console.error('OAuth callback error:', errorMsg);
        setError(errorMsg);
        
        // Redirect to login after showing error
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      } finally {
        setLoading(false);
      }
    };

    // Give Supabase a moment to process the callback URL
    const timer = setTimeout(handleCallback, 300);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading || success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          {success ? (
            <>
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h2>
              <p className="text-gray-600">Redirecting to your dashboard...</p>
            </>
          ) : (
            <>
              <Loader className="w-16 h-16 animate-spin text-cyan-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying your email...</h2>
              <p className="text-gray-600">Please wait while we confirm your account</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Authentication Error</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-gray-600 text-sm">You will be redirected to login shortly...</p>
        </div>
      </div>
    );
  }

  // This shouldn't render, but just in case
  return null;
}

export default AuthCallback;
