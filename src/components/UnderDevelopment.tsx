import { motion } from 'framer-motion';
import { Zap, AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface UnderDevelopmentProps {
  title: string;
  description?: string;
  type?: 'development' | 'premium';
}

const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({
  title,
  description,
  type = 'development',
}) => {
  const navigate = useNavigate();

  const isDevelopment = type === 'development';
  const isPremium = type === 'premium';

  const defaultDescription = isDevelopment
    ? 'This feature is currently being developed and will be available soon.'
    : 'This is a premium feature. Upgrade your plan to unlock it and access powerful tools.';

  const finalDescription = description || defaultDescription;
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-8 md:p-12">
        <motion.div
          className="text-center space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Icon */}
          <motion.div
            className="flex justify-center"
            animate={isDevelopment ? { rotate: [0, 5, -5, 0] } : { y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="relative">
              {isDevelopment ? (
                <Zap className="w-20 h-20 text-amber-400" />
              ) : (
                <Lock className="w-20 h-20 text-purple-400" />
              )}
              <motion.div
                className={`absolute inset-0 rounded-full border-2 ${
                  isDevelopment ? 'border-amber-400/30' : 'border-purple-400/30'
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Heading */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{title}</h1>
            <h2
              className={`text-xl md:text-2xl font-semibold ${
                isDevelopment ? 'text-amber-400' : 'text-purple-400'
              }`}
            >
              {isDevelopment ? 'Under Development' : 'Premium Feature'}
            </h2>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
            {finalDescription}
          </p>

          {/* Alert Box */}
          <motion.div
            className={`${
              isDevelopment
                ? 'bg-amber-500/10 border border-amber-500/30'
                : 'bg-purple-500/10 border border-purple-500/30'
            } rounded-lg p-4 flex items-center gap-3`}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <AlertCircle
              className={`w-5 h-5 flex-shrink-0 ${
                isDevelopment ? 'text-amber-400' : 'text-purple-400'
              }`}
            />
            <p
              className={`text-sm ${
                isDevelopment ? 'text-amber-200' : 'text-purple-200'
              }`}
            >
              {isDevelopment
                ? "We're working hard to bring you this amazing feature. Check back soon!"
                : 'Unlock this feature and access premium tools to enhance your trading experience.'}
            </p>
          </motion.div>

          {/* CTA Button */}
          {isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-3"
              >
                View Premium Plans
              </Button>
            </motion.div>
          )}

          {/* Features Coming Soon */}
          {isDevelopment && (
            <motion.div
              className="pt-6 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-gray-400 font-semibold">What's Coming:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Enhanced Features',
                  'Better Performance',
                  'Improved UI/UX',
                  'Advanced Analytics',
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Benefits List for Premium */}
          {isPremium && (
            <motion.div
              className="pt-6 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-gray-400 font-semibold">You'll get access to:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Advanced Analytics',
                  'AI-Powered Insights',
                  'Priority Support',
                  'Unlimited Features',
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default UnderDevelopment;
