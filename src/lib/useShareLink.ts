import { useState } from 'react';
import supabase from '@/lib/supabase';
import { useAuth } from '@/lib/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface ShareLink {
  id: string;
  user_id: string;
  share_token: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
  title: string;
  description: string | null;
  visible_journals: string[] | null;
}

export const useShareLink = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Generate a unique share token
  const generateToken = () => {
    return `share_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Create a new share link
  const createShareLink = async (
    title: string,
    description?: string,
    expiresAt?: Date,
    visibleJournals?: string[]
  ): Promise<ShareLink | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to share",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const shareToken = generateToken();

      const { data, error } = await supabase
        .from('journal_share_links')
        .insert({
          user_id: user.id,
          share_token: shareToken,
          title,
          description,
          expires_at: expiresAt?.toISOString() || null,
          visible_journals: visibleJournals || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Share link created successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error creating share link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create share link",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get all share links for the user
  const getShareLinks = async (): Promise<ShareLink[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_share_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching share links:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get a specific share link by token (public access)
  const getShareLinkByToken = async (token: string): Promise<ShareLink | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_share_links')
        .select('*')
        .eq('share_token', token)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching share link:', error);
        return null;
      }

      // Get first matching record (should only be one due to unique constraint)
      if (!data || data.length === 0) {
        console.log('No share link found for token:', token);
        return null;
      }

      const shareLink = data[0];

      // Check if link has expired
      if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
        console.log('Share link has expired');
        return null;
      }

      return shareLink;
    } catch (error: any) {
      console.error('Error fetching share link:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update share link
  const updateShareLink = async (
    linkId: string,
    updates: Partial<ShareLink>
  ): Promise<ShareLink | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_share_links')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', linkId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Share link updated successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error updating share link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update share link",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Disable a share link
  const disableShareLink = async (linkId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('journal_share_links')
        .update({ is_active: false })
        .eq('id', linkId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Share link disabled",
      });

      return true;
    } catch (error: any) {
      console.error('Error disabling share link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disable share link",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a share link
  const deleteShareLink = async (linkId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('journal_share_links')
        .delete()
        .eq('id', linkId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Share link deleted",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting share link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete share link",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Record access to a share link
  const recordAccess = async (token: string): Promise<void> => {
    try {
      await supabase
        .from('journal_share_links')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('share_token', token);
    } catch (error) {
      console.error('Error recording access:', error);
    }
  };

  return {
    loading,
    createShareLink,
    getShareLinks,
    getShareLinkByToken,
    updateShareLink,
    disableShareLink,
    deleteShareLink,
    recordAccess,
  };
};
