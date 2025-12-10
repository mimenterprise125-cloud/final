import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    notifications_enabled: true,
    dark_mode: true
  });

  // Load user profile from Supabase
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get current user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!authUser) {
          toast({ title: "Error", description: "User not authenticated", variant: "destructive" });
          return;
        }

        setUser(authUser);

        // Fetch profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 means no rows found, which is ok
          console.error('Profile fetch error:', profileError);
        }

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || "",
            email: authUser.email || "",
            notifications_enabled: profileData.notifications_enabled !== false,
            dark_mode: profileData.dark_mode !== false
          });
        } else {
          // New user, set email from auth
          setProfile(prev => ({
            ...prev,
            email: authUser.email || ""
          }));
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileSave = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          notifications_enabled: profile.notifications_enabled,
          dark_mode: profile.dark_mode,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      // Update auth user email if it changed
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email
        });
        if (emailError) throw emailError;
      }

      toast({
        title: "Settings saved",
        description: "Your profile settings have been updated successfully."
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/#/auth/callback`
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions."
      });
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass p-6">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
            <Button onClick={handleProfileSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass p-6">
          <h2 className="text-xl font-semibold mb-6">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates about your accounts</p>
              </div>
              <Switch
                id="notifications"
                checked={profile.notifications_enabled}
                onCheckedChange={(checked) => {
                  setProfile({ ...profile, notifications_enabled: checked });
                }}
              />
            </div>
            <Button onClick={handleProfileSave} disabled={saving} variant="outline">
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass p-6">
          <h2 className="text-xl font-semibold mb-6">Security</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to send a password reset link to your email address.
            </p>
            <Button 
              variant="destructive" 
              onClick={handlePasswordReset} 
              disabled={saving}
            >
              {saving ? "Sending..." : "Reset Password"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
export default Settings;