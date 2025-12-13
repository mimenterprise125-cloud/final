import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/lib/AdminContext';
import { useAuth } from '@/lib/AuthProvider';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

/**
 * Global Maintenance Guard Component
 * Wraps entire app and redirects to /maintenance page when maintenance_mode is true
 * Blocks access to ALL pages except /maintenance
 */
const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminSettings, loading: adminLoading } = useAdmin();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for both auth and admin settings to load
    if (authLoading || adminLoading) return;

    // If maintenance mode is ON and we're NOT on the maintenance page, redirect
    if (adminSettings.maintenance_mode && location.pathname !== '/maintenance') {
      navigate('/maintenance', { replace: true });
    }
  }, [adminSettings.maintenance_mode, authLoading, adminLoading, navigate, location.pathname]);

  // If both are still loading, don't render anything to prevent flickering
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If maintenance mode is ON, only show maintenance page (prevent any other renders)
  if (adminSettings.maintenance_mode && location.pathname !== '/maintenance') {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
