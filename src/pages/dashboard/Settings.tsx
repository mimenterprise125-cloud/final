import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";
import { Trash2, Edit2, X, Check, Zap, User, Lock, Settings as SettingsIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("setups");
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    notifications_enabled: true,
    dark_mode: true
  });
  const [setups, setSetups] = useState<any[]>([]);
  const [setupsLoading, setSetupsLoading] = useState(false);
  const [editingSetup, setEditingSetup] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

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

        // Load setups
        await loadSetups(authUser.id);
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const loadSetups = async (userId: string) => {
    setSetupsLoading(true);
    try {
      const { data, error } = await supabase
        .from('setups')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSetups(data || []);
    } catch (error: any) {
      console.error('Error loading setups:', error);
    } finally {
      setSetupsLoading(false);
    }
  };

  const handleEditSetup = (setup: any) => {
    setEditingSetup({ ...setup });
  };

  const handleSaveSetup = async () => {
    if (!editingSetup || !user) return;

    try {
      const { error } = await supabase
        .from('setups')
        .update({
          name: editingSetup.name,
          description: editingSetup.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSetup.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setSetups(setups.map(s => s.id === editingSetup.id ? editingSetup : s));
      setEditingSetup(null);
      toast({ title: "Success", description: "Setup updated successfully" });
    } catch (error: any) {
      console.error('Error saving setup:', error);
      toast({ title: "Error", description: "Failed to update setup", variant: "destructive" });
    }
  };

  const handleDeleteSetup = async (setup: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('setups')
        .delete()
        .eq('id', setup.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setSetups(setups.filter(s => s.id !== setup.id));
      setDeleteConfirm(null);
      toast({ title: "Success", description: "Setup deleted successfully" });
    } catch (error: any) {
      console.error('Error deleting setup:', error);
      toast({ title: "Error", description: "Failed to delete setup", variant: "destructive" });
    }
  };

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account, preferences, and trading setups</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-white">
          <TabsTrigger value="setups" className="flex items-center gap-2 text-blue-500 data-[state=active]:text-blue-600">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Setups</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2 text-blue-500 data-[state=active]:text-blue-600">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2 text-blue-500 data-[state=active]:text-blue-600">
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 text-blue-500 data-[state=active]:text-blue-600">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Setups Tab - First */}
        <TabsContent value="setups">
          <Card className="glass p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Trading Setups
            </h2>
            
            {setupsLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">Loading setups...</p>
              </div>
            ) : setups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
                <Zap className="w-8 h-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No setups created yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Create your first setup from the trading journal</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {setups.map((setup) => (
                  <div key={setup.id}>
                    {editingSetup?.id === setup.id ? (
                      <div className="border rounded-lg p-4 space-y-4 bg-accent/5 border-accent/20">
                        <div className="space-y-2">
                          <Label htmlFor={`setup-name-${setup.id}`} className="text-sm font-medium">Setup Name</Label>
                          <Input
                            id={`setup-name-${setup.id}`}
                            value={editingSetup.name}
                            onChange={(e) => setEditingSetup({ ...editingSetup, name: e.target.value })}
                            placeholder="Setup name"
                            className="h-10 bg-muted/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`setup-desc-${setup.id}`} className="text-sm font-medium">Description</Label>
                          <Textarea
                            id={`setup-desc-${setup.id}`}
                            value={editingSetup.description || ""}
                            onChange={(e) => setEditingSetup({ ...editingSetup, description: e.target.value })}
                            placeholder="Describe your setup strategy..."
                            className="min-h-20 bg-muted/50 text-sm"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSetup(null)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveSetup}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 flex items-start justify-between hover:bg-accent/5 hover:border-accent/30 transition-all group">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">{setup.name}</h4>
                          {setup.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {setup.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSetup(setup)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(setup)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="glass p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  className="h-11"
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
                  className="h-11"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card className="glass p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-accent" />
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                <div>
                  <Label htmlFor="notifications" className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email updates about your trades</p>
                </div>
                <Switch
                  id="notifications"
                  checked={profile.notifications_enabled}
                  onCheckedChange={(checked) => {
                    setProfile({ ...profile, notifications_enabled: checked });
                  }}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                <div>
                  <Label htmlFor="darkMode" className="font-medium">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark theme</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={profile.dark_mode}
                  onCheckedChange={(checked) => {
                    setProfile({ ...profile, dark_mode: checked });
                  }}
                  disabled
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={saving} variant="outline">
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="glass p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              Security
            </h2>
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
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Setup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteSetup(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
export default Settings;