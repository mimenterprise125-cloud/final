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

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session that was just created by Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          // ✅ Session established successfully
          // For HashRouter, navigate() automatically handles the # prefix
          navigate('/dashboard/journal', { replace: true });
        } else {
          // ⚠️ No session found - redirect back to login
          // User probably closed the OAuth window or something went wrong
          console.warn('No session found after OAuth callback');
          navigate('/login', { replace: true });
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
    // Increased from 100ms to 500ms to ensure session is established
    const timer = setTimeout(handleCallback, 500);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-600">Completing sign in...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we authenticate your account</p>
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
