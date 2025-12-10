import React from 'react';
import { useAdmin } from '@/lib/AdminContext';
import { useAuth } from '@/lib/AuthProvider';
import UnderMaintenance from '@/pages/UnderMaintenance';
import { Unlock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface FeatureGuardProps {
  feature: 'propfirm' | 'journal';
  children: React.ReactNode;
}

const FeatureGuard: React.FC<FeatureGuardProps> = ({ feature, children }) => {
  const { adminSettings, togglePropFirmLock, toggleJournalLock } = useAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = React.useState(false);

  // Check if user is admin
  const isAdmin = React.useMemo(() => {
    if (!user) return false;
    const userRole = (user?.user_metadata?.role || user?.app_metadata?.role) as string;
    return userRole === 'admin';
  }, [user]);

  // Check if the specific feature is locked FIRST (before maintenance mode)
  const isLocked =
    (feature === 'propfirm' && adminSettings.propfirm_locked) ||
    (feature === 'journal' && adminSettings.journal_locked);

  //console.log(`🔍 FeatureGuard check for '${feature}':`, {
    //propfirm_locked: adminSettings.propfirm_locked,
   // journal_locked: adminSettings.journal_locked,
   // isLocked,
  //});

  // Check maintenance mode AFTER checking if feature is locked
  // This way, locked features show their lock modal even if maintenance mode is on
  if (adminSettings.maintenance_mode && !isLocked) {
    //console.log('🔒 Maintenance mode is ON (feature is not locked)');
    return <UnderMaintenance />;
  }

  // Handle toggle with immediate visual feedback
  const handleToggle = async () => {
    setIsToggling(true);
    const toggleFn = feature === 'propfirm' ? togglePropFirmLock : toggleJournalLock;
    await toggleFn();
    setIsToggling(false);
  };

  if (isLocked) {
    // Determine lock type from individual feature lock type settings
    const lockType = feature === 'propfirm' 
      ? adminSettings.propfirm_lock_type 
      : adminSettings.journal_lock_type;

    const featureTitle = feature === 'propfirm' ? 'PropFirm' : 'Trading Journal';
    const toggleFn = feature === 'propfirm' ? togglePropFirmLock : toggleJournalLock;

    //console.log(`🔐 ${feature} is LOCKED with type: ${lockType}`);

    // When locked, render content blurred with overlay modal on top
    return (
      <div className="relative w-full min-h-screen">
        {/* Blurred Content */}
        <div className="w-full blur-sm pointer-events-none select-none opacity-40">
          {children}
        </div>

        {/* Overlay Modal - Similar to Analytics Lock */}
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/95 border-2 border-slate-700 rounded-2xl p-8 max-w-md mx-4 shadow-2xl text-center"
          >
            {lockType === 'premium' ? (
              <>
                <div className="text-6xl mb-4">💎</div>
                <h2 className="text-3xl font-bold text-white mb-3">Premium Feature</h2>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                  Upgrade your plan to unlock the {featureTitle} feature and access premium tools.
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">⚡</div>
                <h2 className="text-3xl font-bold text-white mb-3">Coming Soon</h2>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                  We're working hard to bring you the {featureTitle} feature. Check back soon!
                </p>
              </>
            )}

            {/* Progress Bar */}
            <div className="mb-8 bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <motion.div
                className={lockType === 'premium' ? 'bg-purple-500' : 'bg-blue-500'}
                initial={{ width: '0%' }}
                animate={{ width: '30%' }}
                transition={{ duration: 2, ease: 'easeOut' }}
                style={{ height: '100%' }}
              />
            </div>

            {/* Unlock Button (Admin Only) */}
            <div className="flex flex-col gap-3">
              {/* Redirect to Journal (for all users) */}
              <Button
                onClick={() => navigate('/dashboard/journal')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-6 text-base rounded-lg transition-all"
              >
                <ArrowRight className="mr-2 w-5 h-5" />
                Explore Journal Dashboard
              </Button>

              {/* Unlock Button (Admin Only) */}
              {isAdmin && (
                <Button
                  onClick={handleToggle}
                  disabled={isToggling}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg rounded-lg disabled:opacity-50"
                >
                  <Unlock className="mr-2 w-5 h-5" />
                  {isToggling ? 'Toggling...' : `Unlock ${featureTitle}`}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Feature is unlocked - render children normally
  return <>{children}</>;
};

export default FeatureGuard;
