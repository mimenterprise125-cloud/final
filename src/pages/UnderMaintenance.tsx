import { motion } from 'framer-motion';
import { AlertTriangle, WifiOff } from 'lucide-react';

const UnderMaintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        className="text-center space-y-8 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icon */}
        <motion.div
          className="flex justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="relative">
            <WifiOff className="w-24 h-24 text-rose-500" />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-rose-500/20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Alert Icon */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertTriangle className="w-16 h-16 mx-auto text-amber-500" />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Under Maintenance
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            We're currently upgrading our systems
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-300 leading-relaxed text-lg">
            Our website is currently down for maintenance. We're working hard to bring you back an even better experience. 
            <br />
            <span className="text-amber-400 font-semibold">Expected to be back online shortly.</span>
          </p>
        </motion.div>

        {/* Status Info */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-400">24/7</div>
            <div className="text-sm text-gray-400">Support Available</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-400">100%</div>
            <div className="text-sm text-gray-400">Data Safe</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-400">Soon</div>
            <div className="text-sm text-gray-400">Coming Back</div>
          </div>
        </motion.div>

        {/* Email Contact */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-400">Need help? Contact us at:</p>
          <a
            href="mailto:support@proptrader.com"
            className="inline-block text-cyan-400 hover:text-cyan-300 font-semibold text-lg transition-colors"
          >
            support@proptrader.com
          </a>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          className="flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-cyan-500"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>
    </div>
  );
};

export default UnderMaintenance;
