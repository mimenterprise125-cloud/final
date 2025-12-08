import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, ArrowRight, ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  cta: string;
  highlighted: boolean;
  features: string[];
  unlockedSections: string[];
}

const defaultTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Get started with basic features',
    cta: 'Get Started',
    highlighted: false,
    features: [
      'Dashboard access',
      'Basic account analytics',
      'Limited to 1 trading account',
      'Community support',
      'Monthly performance reports',
    ],
    unlockedSections: [],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29,
    period: '/month',
    description: 'For serious traders',
    cta: 'Upgrade to Pro',
    highlighted: true,
    features: [
      'Everything in Starter',
      'PropFirm access with advanced tools',
      'Unlimited trading accounts',
      'Trading Journal with AI insights',
      'Advanced analytics & reports',
      'Priority email support',
      'Copy Trading features',
      'API access',
      'Export data in multiple formats',
    ],
    unlockedSections: ['propfirm', 'journal', 'copy_trading'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 79,
    period: '/month',
    description: 'For professional traders',
    cta: 'Upgrade to Premium',
    highlighted: false,
    features: [
      'Everything in Professional',
      'VIP support (phone + chat)',
      'Custom trading strategies',
      'Advanced risk management tools',
      'Monthly 1-on-1 strategy sessions',
      'Exclusive webinars & training',
      'Early access to new features',
      'Custom integrations',
      'Dedicated account manager',
    ],
    unlockedSections: ['propfirm', 'journal', 'copy_trading', 'advanced_analytics'],
  },
];

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const handleSelectTier = (tierId: string) => {
    // TODO: Implement stripe checkout or upgrade flow
    console.log(`Selected tier: ${tierId}`);
    // Navigate to checkout or show upgrade modal
  };

  const getAnnualPrice = (monthlyPrice: number) => {
    // 20% discount for annual billing
    return Math.round(monthlyPrice * 12 * 0.8);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-20">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-8 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold text-sm"
          whileHover={{ x: -4 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </motion.button>

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Choose the perfect plan for your trading journey. Unlock powerful tools and features.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            className="flex justify-center items-center gap-4 mb-12"
            variants={itemVariants}
          >
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Annual
              <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded">
                Save 20%
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {defaultTiers.map((tier) => {
            const displayPrice =
              billingPeriod === 'annual' && tier.price > 0
                ? getAnnualPrice(tier.price)
                : tier.price;

            return (
              <motion.div key={tier.id} variants={itemVariants}>
                <Card
                  className={`relative h-full transition-all duration-300 flex flex-col ${
                    tier.highlighted
                      ? 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/50 shadow-lg shadow-cyan-500/20 md:scale-105'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {/* Popular Badge */}
                  {tier.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        <Star className="w-4 h-4 fill-current" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    {/* Title */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                      <p className="text-gray-400 text-sm">{tier.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold text-white">${displayPrice}</span>
                        {tier.period !== 'forever' && (
                          <span className="text-gray-400 ml-2">{tier.period}</span>
                        )}
                      </div>
                      {billingPeriod === 'annual' && tier.price > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Billed annually at ${getAnnualPrice(tier.price)}
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSelectTier(tier.id)}
                      className={`w-full mb-8 font-semibold py-2 px-4 transition-all ${
                        tier.highlighted
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {user ? tier.cta : 'Sign up to ' + tier.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    {/* Features List */}
                    <div className="space-y-4 flex-1">
                      <p className="text-sm font-semibold text-gray-300">What's included:</p>
                      <ul className="space-y-3">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ or Additional Info */}
        <motion.div
          className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 md:p-12 text-center"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div>
              <h3 className="font-semibold text-cyan-400 mb-2">Can I change plans?</h3>
              <p className="text-gray-400 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-cyan-400 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-400 text-sm">
                We offer 30-day money-back guarantee. If you're not satisfied, we'll refund 100% of your payment.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-cyan-400 mb-2">Need custom plan?</h3>
              <p className="text-gray-400 text-sm">
                Contact our sales team for enterprise solutions tailored to your needs.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
