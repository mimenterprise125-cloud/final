import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AdminSettings, PricingTier } from '@/lib/AdminContext';
import { Trash2, Plus, Edit2, Eye, EyeOff, Check, X } from 'lucide-react';

interface PricingManagementTabProps {
  adminSettings: AdminSettings;
  togglePricingEnabled: () => Promise<void>;
  pricingTiers: PricingTier[];
  setPricingTiers: (tiers: PricingTier[]) => void;
  updatePricingTiers: (tiers: PricingTier[]) => Promise<void>;
}

export const PricingManagementTab: React.FC<PricingManagementTabProps> = ({
  adminSettings,
  togglePricingEnabled,
  pricingTiers,
  setPricingTiers,
  updatePricingTiers,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTier, setNewTier] = useState<Partial<PricingTier>>({
    name: '',
    price: 0,
    features: [],
    locked_sections: [],
  });
  const [newFeature, setNewFeature] = useState('');

  const handleAddTier = async () => {
    if (!newTier.name || !newTier.price) {
      alert('Please enter tier name and price');
      return;
    }

    const tier: PricingTier = {
      id: crypto.randomUUID(),
      name: newTier.name,
      price: newTier.price as number,
      features: newTier.features || [],
      locked_sections: newTier.locked_sections || [],
    };

    const updatedTiers = [...pricingTiers, tier];
    setPricingTiers(updatedTiers);
    await updatePricingTiers(updatedTiers);
    
    setIsAdding(false);
    setNewTier({ name: '', price: 0, features: [], locked_sections: [] });
  };

  const handleDeleteTier = async (id: string) => {
    if (confirm('Are you sure you want to delete this tier?')) {
      const updatedTiers = pricingTiers.filter((t) => t.id !== id);
      setPricingTiers(updatedTiers);
      await updatePricingTiers(updatedTiers);
    }
  };

  const handleSaveTier = async (id: string, updated: Partial<PricingTier>) => {
    const updatedTiers = pricingTiers.map((t) =>
      t.id === id ? { ...t, ...updated } : t
    );
    setPricingTiers(updatedTiers);
    await updatePricingTiers(updatedTiers);
    setEditingId(null);
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Pricing Management</h2>
        <p className="text-gray-400 mt-2">Create and manage subscription tiers</p>
      </div>

      {/* Enable/Disable Toggle */}
      <motion.div whileHover={{ scale: 1.02 }}>
        <Card className={`border-2 p-6 transition-all ${
          adminSettings.pricing_enabled
            ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30'
            : 'bg-gradient-to-br from-slate-700/50 to-slate-800 border-slate-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Pricing Page Status</h3>
              <p className="text-gray-400 text-sm mt-1">
                {adminSettings.pricing_enabled
                  ? '✅ Pricing is active. Users can see and manage subscriptions.'
                  : '❌ Pricing is disabled. All features available to all users.'}
              </p>
            </div>
            <Badge className={adminSettings.pricing_enabled ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-500/30 text-slate-300'}>
              {adminSettings.pricing_enabled ? 'ENABLED' : 'DISABLED'}
            </Badge>
          </div>

          <Button
            onClick={() => togglePricingEnabled()}
            className={`w-full mt-6 font-semibold transition-all ${
              adminSettings.pricing_enabled
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {adminSettings.pricing_enabled ? (
              <>
                <EyeOff className="mr-2 w-4 h-4" />
                Disable Pricing Page
              </>
            ) : (
              <>
                <Eye className="mr-2 w-4 h-4" />
                Enable Pricing Page
              </>
            )}
          </Button>
        </Card>
      </motion.div>

      {/* Pricing Tiers Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Subscription Tiers</h3>
            <p className="text-gray-400 text-sm mt-1">{pricingTiers.length} tier(s) configured</p>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            <Plus className="mr-2 w-4 h-4" />
            {isAdding ? 'Cancel' : 'Add Tier'}
          </Button>
        </div>

        {/* Add New Tier Form */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-semibold text-sm mb-2 block">Tier Name</label>
                  <Input
                    value={newTier.name || ''}
                    onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                    placeholder="e.g., Starter, Professional, Enterprise"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-white font-semibold text-sm mb-2 block">Monthly Price ($)</label>
                  <Input
                    type="number"
                    value={newTier.price || 0}
                    onChange={(e) => setNewTier({ ...newTier, price: parseFloat(e.target.value) })}
                    placeholder="e.g., 29"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-white font-semibold text-sm mb-2 block">Features</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature (e.g., PropFirm Access)"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button
                    onClick={() => {
                      if (newFeature.trim()) {
                        setNewTier({
                          ...newTier,
                          features: [...(newTier.features || []), newFeature],
                        });
                        setNewFeature('');
                      }
                    }}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(newTier.features || []).map((feature, i) => (
                    <Badge
                      key={i}
                      className="bg-cyan-500/30 text-cyan-300 cursor-pointer hover:bg-cyan-500/50"
                      onClick={() => {
                        setNewTier({
                          ...newTier,
                          features: newTier.features!.filter((_, idx) => idx !== i),
                        });
                      }}
                    >
                      {feature} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-600">
                <Button
                  onClick={handleAddTier}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <Check className="mr-2 w-4 h-4" />
                  Create Tier
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false);
                    setNewTier({ name: '', price: 0, features: [], locked_sections: [] });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="mr-2 w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Pricing Tiers Grid */}
        {pricingTiers.length === 0 ? (
          <Card className="bg-slate-800/30 border-slate-700/50 p-12 text-center">
            <p className="text-gray-400 mb-4">No pricing tiers configured yet</p>
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="mr-2 w-4 h-4" />
              Create First Tier
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <motion.div
                key={tier.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900 border-slate-700 p-6 h-full flex flex-col">
                  {editingId === tier.id ? (
                    // Edit Mode
                    <div className="space-y-4 flex-1">
                      <Input
                        value={tier.name}
                        onChange={(e) =>
                          setPricingTiers(
                            pricingTiers.map((t) =>
                              t.id === tier.id ? { ...t, name: e.target.value } : t
                            )
                          )
                        }
                        className="bg-slate-700 border-slate-600 text-white font-bold"
                      />
                      <div>
                        <label className="text-sm text-gray-400">Price ($)</label>
                        <Input
                          type="number"
                          value={tier.price}
                          onChange={(e) =>
                            setPricingTiers(
                              pricingTiers.map((t) =>
                                t.id === tier.id ? { ...t, price: parseFloat(e.target.value) } : t
                              )
                            )
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => handleSaveTier(tier.id, tier)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Check className="mr-2 w-4 h-4" />
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          variant="outline"
                          className="flex-1"
                        >
                          <X className="mr-2 w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white mb-2">{tier.name}</h4>
                        <div className="text-3xl font-bold text-cyan-400 mb-4">${tier.price.toFixed(2)}<span className="text-sm text-gray-400">/mo</span></div>

                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-300">Features:</p>
                          {tier.features.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No features added</p>
                          ) : (
                            <ul className="space-y-1">
                              {tier.features.map((feature, i) => (
                                <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                                  <span className="text-emerald-400">✓</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-6 pt-4 border-t border-slate-700">
                        <Button
                          onClick={() => setEditingId(tier.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Edit2 className="mr-2 w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteTier(tier.id)}
                          className="flex-1 bg-rose-600 hover:bg-rose-700"
                        >
                          <Trash2 className="mr-2 w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 border-cyan-500/30 p-6">
        <div className="flex gap-4">
          <div className="text-2xl">ℹ️</div>
          <div>
            <p className="font-semibold text-white mb-2">Pricing Tier Guide</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Create different subscription tiers with custom pricing</li>
              <li>• Add features to each tier to differentiate offerings</li>
              <li>• When pricing is enabled, locked sections will show upgrade prompts</li>
              <li>• Users will see the pricing page with all configured tiers</li>
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PricingManagementTab;
