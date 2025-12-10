import { motion } from 'framer-motion';
import { AlertTriangle, WifiOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const UnderMaintenance = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"
          animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, -40, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          className="relative z-10 text-center space-y-8 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Icon */}
          <motion.div
            className="flex justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 blur-xl opacity-30" />
              <WifiOff className="w-28 h-28 text-blue-600 relative z-10" />
            </div>
          </motion.div>

          {/* Alert Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">Scheduled Maintenance</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              We'll Be Right Back
            </h1>
            <p className="text-xl md:text-2xl text-slate-600">
              We're performing scheduled maintenance to improve your experience
            </p>
          </motion.div>

          {/* Main Description */}
          <motion.div
            className="bg-white/70 backdrop-blur-sm border border-blue-100 rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              Our platform is currently undergoing essential updates and improvements. We're working around the clock to bring you back a faster, more reliable service.
            </p>
            <p className="text-base text-slate-600">
              <span className="font-semibold text-blue-600">Expected to be back online soon.</span> Thank you for your patience!
            </p>
          </motion.div>

          {/* Status Indicators */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { icon: '🔒', label: 'Data Safe', value: '100%' },
              { icon: '⚡', label: 'High Speed', value: 'Coming' },
              { icon: '🛡️', label: 'Secure', value: '24/7' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl p-5 hover:shadow-lg transition-shadow"
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm text-slate-600">{item.label}</div>
                <div className="text-xl font-bold text-blue-600 mt-1">{item.value}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Login to Account</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => navigate('/')}
              className="bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-600 font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Home
            </motion.button>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            className="space-y-3 pt-4 border-t border-blue-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-slate-600">Have questions? Get in touch</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:support@proptrader.com"
                className="text-blue-600 hover:text-cyan-600 font-semibold transition-colors flex items-center gap-2"
              >
                📧 support@proptrader.com
              </a>
              <span className="text-slate-400">•</span>
              <a
                href="https://twitter.com/proptrader"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-cyan-600 font-semibold transition-colors flex items-center gap-2"
              >
                𝕏 @PropTrader
              </a>
            </div>
          </motion.div>

          {/* Loading Animation */}
          <motion.div
            className="flex justify-center gap-3 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-sm text-slate-600">Maintenance in progress</span>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UnderMaintenance;
