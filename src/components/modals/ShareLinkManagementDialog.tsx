import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useShareLink, ShareLink } from "@/lib/useShareLink";
import { Copy, Trash2, Eye, EyeOff, Calendar, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ShareLinkManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareLinkManagementDialog = ({
  open,
  onOpenChange,
}: ShareLinkManagementDialogProps) => {
  const { getShareLinks, createShareLink, deleteShareLink, disableShareLink } = useShareLink();
  const { toast } = useToast();
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("My Trading Journal");
  const [newDescription, setNewDescription] = useState("");

  // Load share links when dialog opens
  useEffect(() => {
    if (open) {
      loadShareLinks();
    }
  }, [open]);

  const loadShareLinks = async () => {
    setLoading(true);
    const links = await getShareLinks();
    setShareLinks(links);
    setLoading(false);
  };

  const handleCreateShareLink = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the share link",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    const newLink = await createShareLink(newTitle, newDescription || undefined);
    if (newLink) {
      setNewTitle("My Trading Journal");
      setNewDescription("");
      await loadShareLinks();
    }
    setCreating(false);
  };

  const handleDeleteLink = async (linkId: string) => {
    if (confirm("Are you sure you want to delete this share link?")) {
      const success = await deleteShareLink(linkId);
      if (success) {
        await loadShareLinks();
      }
    }
  };

  const handleDisableLink = async (linkId: string) => {
    const success = await disableShareLink(linkId);
    if (success) {
      await loadShareLinks();
    }
  };

  const copyToClipboard = (token: string) => {
    const shareUrl = `${window.location.origin}/#/shared-journal/${token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard",
    });
  };

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/#/shared-journal/${token}`;
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Share Your Journal</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create shareable links to your trading journal. Others can view your trades without signing in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Create New Share Link Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Create New Share Link
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Title</label>
                <Input
                  placeholder="e.g., My January Trading Journal"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description (Optional)</label>
                <Input
                  placeholder="Add a brief description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <Button
                onClick={handleCreateShareLink}
                disabled={creating || !newTitle.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold"
              >
                {creating ? "Creating..." : "Create Share Link"}
              </Button>
            </div>
          </motion.div>

          {/* Existing Share Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Your Share Links</h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
                <p className="text-slate-400 mt-2">Loading share links...</p>
              </div>
            ) : shareLinks.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-lg border border-slate-700">
                <p className="text-slate-400">No share links yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shareLinks.map((link, index) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700 p-4 hover:border-slate-600 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white">{link.title}</h4>
                              <Badge
                                className={`text-xs ${
                                  link.is_active && !isExpired(link.expires_at)
                                    ? "bg-green-900/50 text-green-200"
                                    : "bg-red-900/50 text-red-200"
                                }`}
                              >
                                {isExpired(link.expires_at) ? "Expired" : link.is_active ? "Active" : "Disabled"}
                              </Badge>
                            </div>
                            {link.description && (
                              <p className="text-sm text-slate-400">{link.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Share Link URL */}
                        <div className="flex items-center gap-2 bg-slate-900/50 rounded p-2 border border-slate-700">
                          <Input
                            value={getShareUrl(link.share_token)}
                            readOnly
                            className="flex-1 bg-transparent border-0 text-xs text-slate-300 text-ellipsis"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(link.share_token)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Link Info */}
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-4">
                            <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                            {link.last_accessed_at && (
                              <span>Last viewed {new Date(link.last_accessed_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        {/* Expiry Info */}
                        {link.expires_at && (
                          <div className="flex items-center gap-2 text-xs text-orange-400">
                            <Calendar className="w-4 h-4" />
                            Expires {new Date(link.expires_at).toLocaleDateString()}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-slate-700">
                          {link.is_active ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDisableLink(link.id)}
                              className="flex-1 border-slate-600 hover:bg-red-900/30 text-slate-300 hover:text-red-300"
                            >
                              <EyeOff className="w-4 h-4 mr-2" />
                              Disable
                            </Button>
                          ) : (
                            <div className="flex-1 text-xs text-slate-500 py-2">Link disabled</div>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteLink(link.id)}
                            className="flex-1 border-slate-600 hover:bg-red-900/30 text-slate-300 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/50">
            <p className="text-sm text-blue-200">
              💡 <span className="font-semibold">Tip:</span> Share links allow anyone with the URL to view your trading journal without creating an account. You can disable or delete links anytime.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
