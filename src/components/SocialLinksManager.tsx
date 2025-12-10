import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SocialLink } from '@/lib/AdminContext';
import { motion } from 'framer-motion';
import {
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';

interface SocialLinksManagerProps {
  links: SocialLink[];
  linkType: 'community' | 'footer';
  onUpdate: (links: SocialLink[]) => void;
  isLoading?: boolean;
}

const COMMUNITY_PLATFORMS = [
  { label: 'Discord', icon: '💜', placeholder: 'Paste full Discord link: https://discord.gg/...' },
  { label: 'Instagram', icon: '📸', placeholder: 'Paste full Instagram URL: https://instagram.com/...' },
  { label: 'YouTube', icon: '▶️', placeholder: 'Paste full YouTube URL: https://youtube.com/@...' },
  { label: 'Telegram', icon: '📱', placeholder: 'Paste full Telegram link: https://t.me/...' },
  { label: 'Slack', icon: '🔵', placeholder: 'Paste full Slack invite: https://join.slack.com/...' },
  { label: 'WhatsApp', icon: '💬', placeholder: 'Paste full WhatsApp link: https://chat.whatsapp.com/...' },
];

const FOOTER_PLATFORMS = [
  { label: 'Twitter', icon: '𝕏', placeholder: 'Paste full Twitter URL: https://twitter.com/...' },
  { label: 'LinkedIn', icon: '💼', placeholder: 'Paste full LinkedIn URL: https://linkedin.com/company/...' },
  { label: 'GitHub', icon: '🐙', placeholder: 'Paste full GitHub URL: https://github.com/...' },
];

interface SocialLinksManagerProps {
  links: SocialLink[];
  linkType: 'community' | 'footer';
  onUpdate: (links: SocialLink[]) => void;
  isLoading?: boolean;
}

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({
  links,
  linkType,
  onUpdate,
  isLoading = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<SocialLink>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const platforms = linkType === 'community' ? COMMUNITY_PLATFORMS : FOOTER_PLATFORMS;
  const currentLinks = links.filter(l => l.link_type === linkType);
  const title = linkType === 'community' ? 'Community Links' : 'Footer Social Media Links';
  const description = linkType === 'community' 
    ? 'Add links to your community channels (Discord, Telegram, etc.)'
    : 'Add social media links that appear in the footer';

  const usedPlatforms = currentLinks.map(l => l.label);
  const availablePlatforms = platforms.filter(p => !usedPlatforms.includes(p.label));

  const handleAddLink = () => {
    if (!selectedPlatform || !newUrl.trim()) {
      alert('Please select a platform and enter a URL');
      return;
    }

    // Validate and clean URL
    let cleanUrl = newUrl.trim();
    
    // Check if URL starts with http:// or https://
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      alert('Please paste a complete URL starting with https://');
      return;
    }

    // Try to parse URL to ensure it's valid
    try {
      const urlObject = new URL(cleanUrl);
      const hostname = urlObject.hostname.replace('www.', '');
      const pathname = urlObject.pathname + urlObject.search + urlObject.hash;
      
      // Check if pathname contains the same domain again (duplicate domain)
      if (pathname.includes(hostname) || pathname.includes('www.' + hostname)) {
        alert('URL appears to be duplicated. Please paste the complete link correctly.');
        return;
      }

      // Additional validation: check for suspicious patterns
      if (cleanUrl.includes('//http') || cleanUrl.includes('//https')) {
        alert('Invalid URL format. Please check and try again.');
        return;
      }

    } catch (error) {
      alert('Invalid URL. Please paste a complete URL starting with https://');
      return;
    }

    const newLink: SocialLink = {
      id: `temp_${Date.now()}`,
      link_type: linkType,
      label: selectedPlatform,
      url: cleanUrl,
      order: Math.max(0, ...currentLinks.map(l => l.order)) + 1,
    };

    onUpdate([...links, newLink]);
    setSelectedPlatform(null);
    setNewUrl('');
    setShowAddForm(false);
    setShowDropdown(false);
  };

  const handleDeleteLink = (id: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      onUpdate(links.filter(l => l.id !== id));
    }
  };

  const handleEditStart = (link: SocialLink) => {
    setEditingId(link.id);
    setEditValues({ ...link });
  };

  const handleEditSave = (id: string) => {
    const updatedLinks = links.map(l =>
      l.id === id ? { ...l, ...editValues } : l
    );
    onUpdate(updatedLinks);
    setEditingId(null);
    setEditValues({});
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...currentLinks];
    [reordered[index], reordered[index - 1]] = [reordered[index - 1], reordered[index]];
    const updated = reordered.map((l, i) => ({ ...l, order: i }));
    
    const updatedLinks = links.map(l => {
      const matched = updated.find(u => u.id === l.id);
      return matched ? { ...l, order: matched.order } : l;
    });
    onUpdate(updatedLinks);
  };

  const handleMoveDown = (index: number) => {
    if (index === currentLinks.length - 1) return;
    const reordered = [...currentLinks];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    const updated = reordered.map((l, i) => ({ ...l, order: i }));
    
    const updatedLinks = links.map(l => {
      const matched = updated.find(u => u.id === l.id);
      return matched ? { ...l, order: matched.order } : l;
    });
    onUpdate(updatedLinks);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>

      {currentLinks.length > 0 ? (
        <div className="space-y-2">
          {currentLinks.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {editingId === link.id ? (
                <Card className="bg-slate-800/50 border-slate-700 p-3 sm:p-4 space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm text-gray-400">Label</label>
                    <Input
                      value={editValues.label || ''}
                      onChange={(e) =>
                        setEditValues({ ...editValues, label: e.target.value })
                      }
                      placeholder="e.g., Discord, Twitter"
                      className="bg-slate-700 border-slate-600 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm text-gray-400">URL</label>
                    <Input
                      value={editValues.url || ''}
                      onChange={(e) =>
                        setEditValues({ ...editValues, url: e.target.value })
                      }
                      placeholder="https://..."
                      className="bg-slate-700 border-slate-600 text-white text-sm"
                    />
                  </div>
                  <div className="flex gap-2 justify-end flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditCancel}
                      className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditSave(link.id)}
                      className="bg-cyan-600 hover:bg-cyan-700 text-xs"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Save
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="bg-slate-800/50 border-slate-700 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:border-slate-600 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm sm:text-base">{link.label}</p>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{link.url}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="bg-slate-700 border-slate-600 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === currentLinks.length - 1}
                      className="bg-slate-700 border-slate-600 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditStart(link)}
                      className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteLink(link.id)}
                      className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700 p-4 sm:p-6 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">No links added yet</p>
        </Card>
      )}

      {showAddForm ? (
        <Card className="bg-slate-800/50 border-slate-700 p-3 sm:p-4 space-y-4">
          <h4 className="font-medium text-white text-sm sm:text-base">Add New Link</h4>
          
          {/* Platform Dropdown */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm text-gray-400">Select Platform</label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 sm:px-4 py-2 text-white flex items-center justify-between hover:border-slate-500 transition-colors text-sm"
              >
                <span className="flex items-center gap-2 min-w-0">
                  {selectedPlatform ? (
                    <>
                      <span className="text-base sm:text-lg flex-shrink-0">{platforms.find(p => p.label === selectedPlatform)?.icon}</span>
                      <span className="truncate">{selectedPlatform}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-sm">Choose a platform...</span>
                  )}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ml-2 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-700 border border-slate-600 rounded-lg overflow-hidden z-50 shadow-lg max-h-64 overflow-y-auto"
                >
                  {availablePlatforms.length > 0 ? (
                    availablePlatforms.map((platform) => (
                      <button
                        key={platform.label}
                        onClick={() => {
                          setSelectedPlatform(platform.label);
                          setShowDropdown(false);
                          setNewUrl('');
                        }}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-white hover:bg-slate-600 transition-colors flex items-center gap-3 text-sm"
                      >
                        <span className="text-base sm:text-lg flex-shrink-0">{platform.icon}</span>
                        <span className="font-medium text-xs sm:text-sm">{platform.label}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 sm:px-4 py-2 sm:py-3 text-gray-400 text-xs sm:text-sm">
                      All platforms already added
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* URL Input */}
          {selectedPlatform && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-xs sm:text-sm text-gray-400">URL</label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={platforms.find(p => p.label === selectedPlatform)?.placeholder}
                className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
              />
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setSelectedPlatform(null);
                setNewUrl('');
                setShowDropdown(false);
              }}
              className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddLink}
              disabled={isLoading || !selectedPlatform || !newUrl.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Save Link
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setShowAddForm(true)}
          disabled={availablePlatforms.length === 0}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
          {availablePlatforms.length === 0 ? 'All Platforms Added' : 'Add New Link'}
        </Button>
      )}
    </div>
  );
};

