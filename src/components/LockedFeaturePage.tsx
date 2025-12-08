import React from 'react';
import { useAdmin } from '@/lib/AdminContext';
import { Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthProvider';

interface LockedFeaturePageProps {
  feature: 'propfirm' | 'journal' | 'performance';
  children: React.ReactNode;
}

const LockedFeaturePage: React.FC<LockedFeaturePageProps> = ({ feature, children }) => {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const { adminSettings, togglePropFirmLock, toggleJournalLock, togglePerformanceAnalyticsLock } = useAdmin();
  const [isToggling, setIsToggling] = React.useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check maintenance mode first
  if (adminSettings.maintenance_mode) {
    //console.log('🔒 Maintenance mode is ON');
    return <div className="flex items-center justify-center min-h-screen text-white">Under Maintenance</div>;
  }

  // Check if the specific feature is locked
  const isLocked =
    (feature === 'propfirm' && adminSettings.propfirm_locked) ||
    (feature === 'journal' && adminSettings.journal_locked) ||
    (feature === 'performance' && adminSettings.performance_analytics_locked);

  //console.log(`🔍 LockedFeaturePage check for '${feature}':`, {
  //  //propfirm_locked: adminSettings.propfirm_locked,
  //  //journal_locked: adminSettings.journal_locked,
  //  //isLocked,
  //  //isToggling,
  //});

  // Handle toggle with immediate visual feedback
  const handleToggle = async () => {
    setIsToggling(true);
    let toggleFn;
    if (feature === 'propfirm') {
      toggleFn = togglePropFirmLock;
    } else if (feature === 'journal') {
      toggleFn = toggleJournalLock;
    } else {
      toggleFn = togglePerformanceAnalyticsLock;
    }
    await toggleFn();
    // Keep toggling state true for a moment to prevent flash
    setTimeout(() => setIsToggling(false), 500);
  };

  // If toggling, keep showing the lock screen until the toggle completes
  const shouldShowLocked = isLocked || isToggling;

  const isAdmin = user?.user_metadata?.role === 'admin';

  if (shouldShowLocked) {
    // Determine lock type from individual feature lock type settings
    const lockType = feature === 'propfirm' 
      ? adminSettings.propfirm_lock_type 
      : feature === 'journal'
      ? adminSettings.journal_lock_type
      : adminSettings.performance_lock_type;

    const featureTitle = feature === 'propfirm' ? 'PropFirm' : feature === 'journal' ? 'Trading Journal' : 'Performance Analytics';

    //console.log(`🔐 ${feature} is LOCKED with type: ${lockType}`);
    // Render children blurred and non-interactive behind a modal overlay
    return (
      <div className="relative w-full min-h-screen">
        {/* Blurred background content */}
        <div className="w-full pointer-events-none select-none blur-sm opacity-25">{children}</div>

        {/* Overlay backdrop with enhanced blur */}
        <div className="fixed inset-0 z-[9998] bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-lg" aria-hidden />

        {/* Modal on top */}
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className={`w-full max-w-sm rounded-3xl border shadow-2xl text-center my-auto ${
              lockType === 'premium'
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-purple-500/30'
                : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-blue-500/30'
            }`}
          >
            {/* Top accent bar */}
            <div
              className={`h-1 rounded-t-3xl ${
                lockType === 'premium' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
            />

            <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
              {/* Emoji with animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="text-6xl sm:text-7xl mb-4 sm:mb-5 inline-block"
              >
                {lockType === 'premium' ? '💎' : '⚡'}
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight">
                {lockType === 'premium' ? 'Premium Feature' : 'Coming Soon'}
              </h2>

              {/* Subtitle */}
              <p className="text-gray-400 mb-6 sm:mb-7 text-xs sm:text-sm leading-relaxed font-medium">
                {lockType === 'premium'
                  ? `Upgrade your plan to unlock the ${featureTitle} feature and access premium trading tools.`
                  : `We're working hard to bring you the ${featureTitle} feature. Check back soon!`}
              </p>

              {/* Progress Bar */}
              <div className="mb-7 sm:mb-8">
                <div className="bg-slate-700/40 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className={lockType === 'premium' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}
                    initial={{ width: '0%' }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 2.5, ease: 'easeOut' }}
                    style={{ height: '100%' }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2.5 sm:space-y-3">
                {lockType === 'premium' ? (
                  <>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => navigate('/pricing')}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2.5 sm:py-3 rounded-xl text-sm sm:text-base transition-all shadow-lg hover:shadow-purple-500/50"
                      >
                        Explore Pricing Plans
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => navigate('/dashboard/journal')}
                        className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-semibold py-2.5 sm:py-3 rounded-xl text-sm sm:text-base transition-all shadow-lg hover:shadow-slate-500/50"
                      >
                        Back to Journal
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => navigate('/dashboard/journal')}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-2.5 sm:py-3 rounded-xl text-sm sm:text-base transition-all shadow-lg hover:shadow-blue-500/50"
                    >
                      Back to Journal
                    </Button>
                  </motion.div>
                )}

                {isAdmin && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleToggle}
                      disabled={isToggling}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 sm:py-3 rounded-xl text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-emerald-500/50"
                    >
                      <Unlock className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                      {isToggling ? 'Toggling...' : `Toggle Lock`}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Feature is unlocked - render children (main dashboard)
  return <>{children}</>;
};

export default LockedFeaturePage;
