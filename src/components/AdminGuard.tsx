import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '@/lib/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Master admin password - in production, use environment variable
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  React.useEffect(() => {
    const checkAdminRole = async () => {
      try {
        if (!user) {
          setCheckingRole(false);
          return;
        }

        // Check user metadata for admin role
        const userRole = (user?.user_metadata?.role || user?.app_metadata?.role) as string;
        const adminRole = userRole === 'admin';
        
        if (adminRole) {
          setIsAdmin(true);
          setCheckingRole(false);
        } else {
          // Non-admin needs to provide password
          setShowPasswordPrompt(true);
          setCheckingRole(false);
        }
      } catch (err) {
        console.error('Error checking admin role:', err);
        setCheckingRole(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      // Check password
      if (password === ADMIN_PASSWORD) {
        setIsAdmin(true);
        setShowPasswordPrompt(false);
      } else {
        setError('Invalid admin password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('Failed to verify credentials. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Show loading while checking role
  if (checkingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/20 border-t-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show password prompt if not admin
  if (showPasswordPrompt && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
              <p className="text-gray-400 text-sm">
                Enter the admin password to access the admin panel
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isVerifying}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-500"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <p className="text-sm text-rose-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!password || isVerifying}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {isVerifying ? 'Verifying...' : 'Access Admin Panel'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  // If admin (either by role or password), show children
  if (isAdmin) {
    return <>{children}</>;
  }

  // Default: not authorized
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-gray-400">
            You don't have permission to access the admin panel.
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminGuard;
